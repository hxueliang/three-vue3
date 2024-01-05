<!-- 184.普通/接触/级联/烘焙/pcss阴影优缺点 -->

<!-- 烘焙阴影
缺点：物体移动，阴影还还在原处，只适用于静态的物体。因为贴图是固定的，不会变
优点：性能是最佳的。因为不需要再计算
https://localhost:8080/examples/webgl_materials_lightmap
-->

<!-- 接触阴影
缺点：使用场景有限，通常用在纯色背景中使用
优点：性能是最较佳的
https://localhost:8080/examples/webgl_shadow_contact
-->

<!-- 普通阴影
缺点：
  1、场景分辨率不大，相机分辨率设置的分辨率较大时，会出现一个个像素格子或条纹。
  2、场景分辨率不大，相机分辨率设置的分辨率也不大时，虽然不会出现一个个像素格子或条纹，但是阴影没有从实到虚的效果，感觉很硬实
https://localhost:8080/examples/webgl_shadowmap 
-->

<!-- 软阴影（如：pcss）
缺点：需要更多的计算消耗
优点：效果最好
https://localhost:8080/examples/webgl_shadowmap_pcss
-->

<!-- 级联阴影
优点：可实现远近阴影不用的分辨率
https://localhost:8080/examples/webgl_shadowmap_csm
-->

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

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let scene, camera, renderer, controls;

init();

// 初始化
function init() {
  createScene();
  createCamera();
  createRenderer();
  createAxes();
  // createAmbientLight();
  // createDirLight();
  // createPointLight();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);
}

// 创建场景
function createScene() {
  scene = new THREE.Scene();
}

// 创建相机
function createCamera(x = 0, y = 0, z = 10) {
  camera = new THREE.PerspectiveCamera(25, innerWidth / innerHeight, 0.1, 3000);
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
</style>
<style>
body {
  background-color: #1e1a20;
}
</style>