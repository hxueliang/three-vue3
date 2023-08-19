<!-- 114.使用css2d渲染器_渲染地球标签 -->
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

import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

const innerWidth = window.innerWidth;
const innerHeight = window.innerHeight;
const container = ref(null);

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let scene, camera, renderer, cantrols;

// 业务常量/变量
const EARTH_RADIUS = 1;
const MOON_RADIUS = 0.27;
let moon = null;
let labelRenderer = null;

init();

// 初始化
function init() {
  createScene();
  createCamera(0, 0, 10);
  createCode();
  createRenderer();
  // 114.2.4 调用CSS2D渲染器
  createCSS2DRenderer();
  createAxes(false);
  createAmbientLight(0.5);
  window.addEventListener('resize', onWindowResize);
}

// 添加业务代码
function createCode() {
  createEarth();
  createMoon();
}

// 114.0 创建地球
function createEarth() {
  const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 16, 16);
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load("textures/planets/earth_atmos_2048.jpg"),
  });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earth);

  // 114.1 添加提示标签，用CSS2DObject包装普通DOM，并添加进对应物体
  const earthDiv = document.createElement('div');
  earthDiv.className = "label";
  earthDiv.innerHTML = "地球";
  const earthLabel = new CSS2DObject(earthDiv);
  earthLabel.position.set(0, EARTH_RADIUS, 0);
  earth.add(earthLabel);

}

// 114.0 创建月球
function createMoon() {
  const moonGeometry = new THREE.SphereGeometry(MOON_RADIUS, 16, 16);
  const moonMaterial = new THREE.MeshPhongMaterial({
    shininess: 5,
    map: textureLoader.load("textures/planets/moon_1024.jpg"),
  });
  moon = new THREE.Mesh(moonGeometry, moonMaterial);
  scene.add(moon);
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

// 114.2.1 创建css2d的渲染器
function createCSS2DRenderer() {
  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(innerWidth, innerHeight);

  labelRenderer.domElement.style.position = 'fixed';
  labelRenderer.domElement.style.top = '0px';
  labelRenderer.domElement.style.left = '0px';
  labelRenderer.domElement.style.zIndex = '10';
  labelRenderer.domElement.style.color = '#ffffff';
}

// 创建渲染函数
function render() {
  const elapsed = clock.getElapsedTime();

  // 114.0 让月球绕地球转
  moon.position.set(Math.sin(elapsed) * 5, 0, Math.cos(elapsed) * 5);

  cantrols && cantrols.update();
  renderer.render(scene, camera);

  // 114.2.3 labelRenderer渲染
  labelRenderer.render(scene, camera);

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
  const innerWidth = window.innerWidth;
  const innerHeight = window.innerHeight;
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}

// 添加画布进DOM
function appendCanvas() {
  container.value.appendChild(renderer.domElement);
  // 114.2.2 添加进DOM
  container.value.appendChild(labelRenderer.domElement);
}

onMounted(() => {
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