<!-- 137.打造元宇宙 -->
<!-- 物理网格材质 -->
<!-- 真实动态映射环境物体纹理（非环境纹理） -->
<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import gsap from 'gsap';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

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

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
const container = ref(null);

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let scene, camera, renderer, controls, stats;

// 球材质
let sphereMaterial;
// 用来缓存实现纹理
let cubeRenderTarget;
// 立方体相机
let cubeCamera;

init();

// 初始化
function init() {
  createScene();
  createCamera(0, 5, 10);
  createRenderer();
  createStats();
  createAxes();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  initEnv();
  createSphere();
  createCube();
  createCubeRenderTarget();
  createCubeCamera();
}

// 1.创建cubeRenderTarget
function createCubeRenderTarget() {
  // 创建cubeRenderTarget，用来缓存实现纹理
  cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512);
}

// 2.创建cubeCamera
function createCubeCamera() {
  // 创建立方体相机，每次拍摄到的东西缓存到cubeRenderTarget
  cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
}

// 加载环境贴图
function initEnv() {
  const hdrLoader = new RGBELoader();
  hdrLoader.load('./hdr/023.hdr', texture => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.format = THREE.RGBAFormat;
    scene.background = texture;
    scene.environment = texture;
    // 3.设置球的材质为实时缓存的材质
    sphereMaterial.envMap = cubeRenderTarget.texture;
  });
}

// 创建球
function createSphere() {
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  sphereMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    roughness: 0,
    metalness: 1,
  });
  const sphere = new THREE.Mesh(geometry, sphereMaterial);
  scene.add(sphere);
}

// 创建球
function createCube() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(3, 0, 0);
  scene.add(cube);
}

// 创建场景
function createScene() {
  scene = new THREE.Scene();
  // 新增
  scene.background = new THREE.Color(0x88ccee);
  // scene.fog = new THREE.Fog(0x88ccee, 0, 50);
}

// 创建相机
function createCamera(x = 0, y = 0, z = 10) {
  camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.001, 1000);
  camera.position.set(x, y, z);
  scene.add(camera);
}

// 创建渲染器
function createRenderer() {
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(innerWidth, innerHeight);
  // 新增
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
}

// 创建渲染函数
function render() {
  const elapsed = clock.getElapsedTime();

  // 4.更新cubeCamera
  cubeCamera.update(renderer, scene);

  controls && controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

// 创建性能监控
function createStats() {
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0';
}

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

// 添加stats进DOM
function appendStats() {
  container.value.appendChild(stats.domElement);
}

onMounted(() => {
  createCode();
  appendCanvas();
  appendStats();
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