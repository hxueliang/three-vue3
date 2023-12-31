<!-- 129.尾巴 -->
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

innerWidth = window.innerWidth;
innerHeight = window.innerHeight;
const container = ref(null);

// const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();
const rgbeLoader = new RGBELoader();
const gltfLoader = new GLTFLoader();

let scene, camera, renderer, controls;

let mixer;

init();

// 初始化
function init() {
  createScene();
  createCamera(1, 3, 15);
  createRenderer();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  rgbeLoader.load('./hdr/023.hdr', envMap => {
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = envMap;
    scene.environment = envMap;
  });

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./draco/');
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load('./model/mobile/tail.glb', gltf => {
    scene.add(gltf.scene);

    mixer = new THREE.AnimationMixer(gltf.scene);
    const clip = gltf.animations[0];
    const action = mixer.clipAction(clip);
    action.play();
  });
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
  const time = clock.getDelta();

  mixer && mixer.update(time);

  controls && controls.update();
  renderer.render(scene, camera);
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

canvas {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}

.btn {
  position: fixed;
  left: 50px;
  top: 50px;
  background: skyblue;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1000;
}
</style>
<style>
body {
  background-color: #1e1a20;
}
</style>