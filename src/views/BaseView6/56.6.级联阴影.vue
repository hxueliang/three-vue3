<!-- 56.6.级联阴影 -->
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
import { DoubleSide } from 'three';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
const container = ref(null);

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/");
gltfLoader.setDRACOLoader(dracoLoader);

let scene, camera, renderer, controls;

init();

// 初始化
function init() {
  createScene();
  createCamera(4, 8, 40);
  createRenderer();
  createAxes();
  // createAmbientTexture();
  createAmbientLight();
  // createDirLight();
  // createPointLight();
  // createSpotLight();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  // 添加平行光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(-1, 1, 1);
  directionalLight.target.position.set(0, 0, -6);
  directionalLight.castShadow = true;
  // 产生阴影相机
  directionalLight.shadow.camera.near = 5; // 产生阴影的最近距离
  directionalLight.shadow.camera.far = 60; // 产生阴影的最远距离
  directionalLight.shadow.camera.left = -30; // 产生阴影距离位置的最左边位置
  directionalLight.shadow.camera.right = 30; // 最右边
  directionalLight.shadow.camera.top = 30; // 最上边
  directionalLight.shadow.camera.bottom = -30; // 最下面
  // 阴影分辨率
  directionalLight.shadow.mapSize.width = 1024 * 8;
  directionalLight.shadow.mapSize.height = 1024 * 8;
  scene.add(directionalLight);
  // 平行光helper
  const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
  scene.add(cameraHelper);

  // 平面
  const planeGeo = new THREE.PlaneGeometry(20, 100);
  const planeMat = new THREE.MeshPhongMaterial({ color: '#999' });
  const plane = new THREE.Mesh(planeGeo, planeMat);
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(plane);

  // 立文体
  const material1 = new THREE.MeshPhongMaterial({ color: '#08d9d6' });
  const material2 = new THREE.MeshPhongMaterial({ color: '#ff2e63' });
  const geometry = new THREE.BoxGeometry(1, 3, 1);
  for (let i = 0; i < 16; i++) {
    const cube1 = new THREE.Mesh(geometry, i % 2 === 0 ? material1 : material2);
    cube1.castShadow = true;
    cube1.receiveShadow = true;
    scene.add(cube1);
    cube1.position.set(3, 2, - i * 2.5);
    cube1.scale.y = Math.random() * 0.2 + 0.6;

    const cube2 = new THREE.Mesh(geometry, i % 2 === 0 ? material2 : material1);
    cube2.castShadow = true;
    cube2.receiveShadow = true;
    scene.add(cube2);
    cube2.position.set(- 3, 2, - i * 2.5);
    cube2.scale.y = Math.random() * 0.2 + 0.6;
  }
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
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
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