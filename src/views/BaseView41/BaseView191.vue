<!-- 191.发光和轮廓混合交互特效 -->
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
  OutlineEffect,
} from 'postprocessing';


let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
const container = ref(null);

const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();
const rgbeLoader = new RGBELoader();

let scene, camera, renderer, controls;

let composer, bear;

init();

// 初始化
function init() {
  createScene();
  createCamera(10, 4, 0);
  createRenderer();
  createAxes();
  createAmbientTexture();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  // 添加模型
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  gltfLoader.setDRACOLoader(dracoLoader);

  gltfLoader.load('./model/effect/bear.gltf', gltf => {
    bear = gltf.scene.children[0];
    bear.position.set(0, 0, -4);
    scene.add(bear);
  });

  gltfLoader.load('./model/effect/elephant.gltf', gltf => {
    bear = gltf.scene.children[0];
    bear.position.set(0, 0, 4);
    scene.add(bear);
  });

  gltfLoader.load('./model/effect/dear.gltf', gltf => {
    bear = gltf.scene.children[0];
    scene.add(bear);
  });

  // 后期处理
  composer = new EffectComposer(renderer); // 实例化后期处理
  composer.addPass(new RenderPass(scene, camera)); // 添加renderPass

  // 添加发光效果
  const bloomEffect = new SelectiveBloomEffect(scene, camera, {
    // mipmapBlur: true,
    bloomEffect: BlendFunction.ADD,
    luminanceThreshold: 0.7,
    luminanceSmoothing: 0.3,
    intensity: 10,
  });
  // bloomEffect.luminancePass.enabled = false; // 不控制四散光芒
  // bloomEffect.ignoreBackground = true; // 背影不发光
  // bloomEffect.inverted = true; // 反选发光与不发光

  // 添加轮廓效果
  const outlineEffect = new OutlineEffect(scene, camera, {
    blendFunction: BlendFunction.ADD,
    edgeStrength: 3, // 边缘强度
    pulseSpeed: 0, // 脉冲速度
    visibleEdgeColor: 0xffffff, // 可见边缘色
    hiddenEdgeColor: 0x22090a, // 隐藏边缘色
    blur: false,
    xRay: true,
    usePatternItextrue: false,
  });

  // 添加抗锯齿效果
  const smaaEffect = new SMAAEffect();

  // 创建outline通道，已经提升outline抗锯齿效果，担性能有所下降
  const outlinePass = new EffectPass(camera, outlineEffect);
  // composer.addPass(outlinePass);

  // 创建总和效果通道
  const effectPass = new EffectPass(
    camera,
    bloomEffect,
    // outlineEffect, // 已经创建独立的通道
    smaaEffect,
  );
  composer.addPass(effectPass);

  // 添加鼠标点击事件
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  window.addEventListener('click', event => {
    mouse.x = event.clientX / window.innerWidth * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight * 2 - 1);
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      const object = intersects[0].object;
      bloomEffect.selection.toggle(object);
      outlineEffect.selection.toggle(object);
    }
  });

  // 发光效果没达到阈值，添加灯光
  const spotLight = createSpotLight(-200, 200, -200, 30);
  spotLight.angle = 0.1;
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
  rgbeLoader.load('./hdr/powerplant.hdr', texture => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
    scene.backgroundBlurriness = 0.5; // 背景模糊强度
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