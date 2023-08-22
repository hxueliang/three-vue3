<!-- 121.全景看房_客厅 -->
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

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
const container = ref(null);

// const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let scene, camera, renderer, cantrols;

init();

// 初始化
function init() {
  createScene();
  createCamera(0, 0, 0);
  createRenderer();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  // 121.1.1 创建客厅
  const geometry = new THREE.BoxGeometry(10, 10, 10);
  geometry.scale(1, 1, -1); // 让镜头到盒子内部
  const textureUrl = './imgs/livingroom/';
  const roomIndex = 0;
  const textureNames = [
    `${roomIndex}_l`,
    `${roomIndex}_r`,
    `${roomIndex}_u`,
    `${roomIndex}_d`,
    `${roomIndex}_b`,
    `${roomIndex}_f`,
  ];
  // 121.1.2 创建6个页面的材质
  const textureBox = textureNames.map((item, index) => {
    console.log(item);
    const texture = new THREE.TextureLoader().load(textureUrl + item + ".jpg");
    // 上下两张贴图方向不对，要旋转一下
    if ([`${roomIndex}_u`, `${roomIndex}_d`].includes(item)) {
      texture.rotation = Math.PI;
      texture.center = new THREE.Vector2(0.5, 0.5);
    }
    return new THREE.MeshBasicMaterial({ map: texture });
  });
  const cube = new THREE.Mesh(geometry, textureBox);
  scene.add(cube);

  // 121.2 监听鼠标事件，实现拖动画面
  let isMouseDown = false;
  container.value.addEventListener('mousedown', _ => isMouseDown = true, false);
  container.value.addEventListener('mouseup', _ => isMouseDown = false, false);
  container.value.addEventListener('mouseout', _ => isMouseDown = false, false);
  container.value.addEventListener('mousemove', event => {
    if (!isMouseDown) { return; }
    camera.rotation.y += event.movementX * 0.002;
    camera.rotation.x += event.movementY * 0.002;
    camera.rotation.order = 'YXZ'; // 顺序
  }, false);
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

  cantrols && cantrols.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

// 创建控制器
function createControls() {
  cantrols = new OrbitControls(camera, container.value);
  cantrols.enableDamping = true;
  cantrols.dampingFactor = 0.05;
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