<!-- 131.物体轮廓发光 -->
<!-- https://localhost:8080/examples/?q=postprocessing#webgl_postprocessing_outline -->
<!-- https://localhost:8080/examples/webgl_postprocessing_outline.html -->
<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import gsap from 'gsap';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';

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

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";

innerWidth = window.innerWidth;
innerHeight = window.innerHeight;
const container = ref(null);

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let scene, camera, renderer, controls;

let sphere, torusKnot, cube;

let composer;

init();

// 初始化
function init() {
  createScene();
  createCamera(1, 5, 10);
  createRenderer();
  createAxes();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  createSphere();
  createTorusKnot();
  createBox();

  createEffect();
}

// 添加后期处理
function createEffect() {
  // 创建 效果合成器
  composer = new EffectComposer(renderer);
  // 实现化RenderPass
  const renderPass = new RenderPass(scene, camera);
  // 添加渲染通道
  composer.addPass(renderPass);

  // 创建 轮廓过程
  const outlinePass = new OutlinePass(
    new THREE.Vector2(innerWidth, innerHeight),
    scene,
    camera
  );
  // 设置选中的物体
  outlinePass.selectedObjects = [torusKnot];
  // 将传入的过程添加到过程链
  composer.addPass(outlinePass);

  // 切换选中的物体
  window.addEventListener('click', () => {
    const { length } = outlinePass.selectedObjects;
    outlinePass.selectedObjects = length === 1 ? [sphere, cube] : [torusKnot];
  });
}

// 创建球
function createSphere() {
  const geometry = new THREE.SphereGeometry(1, 32, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(-5, 0, 0);
  scene.add(sphere);
}

// 创建扭结
function createTorusKnot() {
  const geometry = new THREE.TorusKnotGeometry(1, 0.4, 64, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  torusKnot = new THREE.Mesh(geometry, material);
  scene.add(torusKnot);
}

// 创建立方体
function createBox() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(5, 0, 0);
  scene.add(cube);
}

// 创建场景
function createScene() {
  scene = new THREE.Scene();
}

// 创建相机
function createCamera(x = 0, y = 0, z = 10) {
  camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 300);
  camera.position.set(x, y, z);
  scene.add(camera);
}


// 创建渲染器
function createRenderer() {
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(innerWidth, innerHeight);
}

// 创建渲染函数
function render() {
  const elapsed = clock.getElapsedTime();

  controls && controls.update();

  // 使用composer渲染
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