<!-- 190.提升渲染效果具体细节实现流程 -->
<!-- 
  后期处理
  https://github.com/pmndrs/postprocessing
  屏幕空间反射
  https://github.com/0beqz/screen-space-reflections
-->
<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import gsap from 'gsap';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import { LogLuvLoader } from 'three/examples/jsm/loaders/LogLuvLoader';
import { RGBMLoader } from 'three/examples/jsm/loaders/RGBMLoader';
import { SSREffect } from 'screen-space-reflections';
import {
  EffectComposer,
  RenderPass,
  SelectiveBloomEffect,
  BlendFunction,
  EffectPass,
  SMAAEffect,
  SSAOEffect,
  NormalPass,
  GodRaysEffect,
} from 'postprocessing';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
const container = ref(null);

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let scene, camera, renderer, controls;

let composer;

init();

// 初始化
function init() {
  createScene();
  createCamera(0, 1.5, 8);
  createRenderer();
  createAxes();
  createAmbientTexture();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load('./model/effect/court-transformed.glb', gltf => {
    gltf.scene.traverse(child => {
      if (!child.isMesh) { return; }
      // 开启投射和接收阴影
      child.castShadow = true;
      child.receiveShadow = true;
      // 降低周围物体的亮度
      child.material.envMapIntensity = 0.3;
    });
    gltf.scene.position.set(0, -0.5, 0);
    scene.add(gltf.scene);
  });

  // 添加聚光灯充当太阳
  // 155强度用300000，146强度用3
  const sum = createSpotLight(-200, 200, -100, 3, 0xffffff, true);
  sum.shadow.mapSize.width = 2048;
  sum.shadow.mapSize.height = 2048;
  sum.shadow.bias = -0.00001;
  sum.angle = 0.1;

  // 后期处理
  composer = new EffectComposer(renderer); // 实例化后期处理
  composer.addPass(new RenderPass(scene, camera)); // 添加renderPass
  const bloomEffect = new SelectiveBloomEffect(scene, camera, { // 实例化辉光效果
    blendFunction: BlendFunction.ADD, // 混合模式
    mipmapBlur: true, // 模糊
    luminanceThreshold: 0.7, // 亮度阈值
    luminanceSmoothing: 0.3, // 亮度平滑
    intensity: 30, // 强度
  });

  // 提升抗锯齿效果
  const smaaEffect = new SMAAEffect();

  // 环境光遮蔽效果
  const normalPass = new NormalPass(scene, camera);
  const ssaoEffect = new SSAOEffect(camera, normalPass.texture, {
    // https://github.com/pmndrs/postprocessing/blob/main/demo/src/demos/SSAODemo.js
    // https://pmndrs.github.io/postprocessing/public/docs/class/src/effects/SSAOEffect.js~SSAOEffect.html
    blendFunction: BlendFunction.MULTIPLY,
    samples: 32,
    rings: 3,
    luminanceInfluence: 0.1,
    radius: 0.005,
    bias: 0,
    intensity: 1.33,
  });

  /*
  // 体积光效果
  const roomLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  roomLight.position.set(0, 5, 0);
  scene.add(roomLight);
  const godRaysEffect = new GodRaysEffect(camera, roomLight);
  */

  // 添加屏幕空间反射
  const ssrEffect = new SSREffect(scene, camera);

  // 创建效果通道
  const effectPass = new EffectPass(
    camera,
    bloomEffect,
    ssaoEffect,
    // godRaysEffect,
    ssrEffect, // 需要更换three@0.146.0才不报错
    smaaEffect,
  );
  composer.addPass(effectPass);
}

// 创建场景
function createScene() {
  scene = new THREE.Scene();
}

// 创建相机
function createCamera(x = 0, y = 0, z = 10) {
  camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
  camera.position.set(x, y, z);
  scene.add(camera);
}

// 创建渲染器
function createRenderer() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    // 希望有更高的效果，设置对数深度缓冲区
    logarithmicDepthBuffer: true,
    // 需要高精度
    powerPreference: 'high-performance',
  });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 使用软阴影
}

// 创建渲染函数
function render() {
  const elapsed = clock.getElapsedTime();

  controls && controls.update();
  composer.render();
  requestAnimationFrame(render);
};

// 创建控制器
function createControls() {
  controls = new OrbitControls(camera, container.value);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
}

// 添加坐标轴辅助器
function createAxes(show = true) {
  if (!show) { return; }
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
}

// 添加环境纹理
function createAmbientTexture() {
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load('./hdr/noon_grass_1k.hdr', texture => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  });
}

// 添加环境光
function createAmbientLight(strength = 1, color = '#ffffff') {
  const ambientLight = new THREE.AmbientLight(color, strength);
  scene.add(ambientLight);
}

// 添加点光源
function createPointLight(x = 0, y = 0, z = 10, strength = 1, color = '#ffffff') {
  const pointLight = new THREE.PointLight(color, strength);
  pointLight.position.set(x, y, z);
  scene.add(pointLight);
}

// 添加平行光
function createDirLight(x = 0, y = 0, z = 10, strength = 1, color = '#ffffff', castShadow = false) {
  const dirLight = new THREE.DirectionalLight(color, strength);
  dirLight.castShadow = castShadow;
  dirLight.position.set(x, y, z);
  scene.add(dirLight);
}

// 添加聚光灯
function createSpotLight(x = 0, y = 0, z = 10, strength = 1000, color = '#ffffff', castShadow = false) {
  const light = new THREE.SpotLight(color, strength);
  light.position.set(x, y, z);
  light.castShadow = castShadow;
  scene.add(light);
  return light;
}

// 监听视口变化
function onWindowResize() {
  innerWidth = window.innerWidth;
  innerHeight = window.innerHeight;
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}

// 添加画布进DOM
function appendCanvas() {
  container.value.appendChild(renderer.domElement);
}

onMounted(() => {
  createCode();
  appendCanvas();
  createControls();
  render();
});
</script>

<style lang="less" scope>
.container {
  width: 100vw;
  height: 100vh;
}
</style>
<style>
body {
  background-color: #1e1a20;
}
</style>