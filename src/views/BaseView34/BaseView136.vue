<!-- 136.打造元宇宙 -->
<!-- 渲染大量几何体不一样，材质相同的物体 -->
<!-- 使用BufferGeometryUtils.mergeGeometries -->
<!-- 将所有材质相同的物体合并为一个物体 -->
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
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';

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

init();

// 初始化
function init() {
  createScene();
  createCamera(0, 5, 10);
  createRenderer();
  createStats();
  // createAxes();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  createPlane();
  createTorusKnot(10000);
}

// 创建平面
function createPlane() {
  const geometry = new THREE.PlaneGeometry(20, 20, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0xfffffff,
    side: THREE.DoubleSide,
  });
  const plane = new THREE.Mesh(geometry, material);
  plane.receiveShadow = true;
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);
}

// 创建count个，形状不同，材质相同，的扭结
function createTorusKnot(count = 1) {
  const material = new THREE.MeshBasicMaterial({ color: 0x66ff00 });
  const spaceSize = 100;
  const geometries = [];
  for (let i = 0; i < count; i++) {
    const geometry = new THREE.TorusKnotGeometry(
      0.5 + Math.random() * 0.5,
      0.3,
      50 + parseInt(Math.random() * 50),
      16,
    );
    // 关键的代码
    const matrix = new THREE.Matrix4();
    // 随机旋转角度
    matrix.makeRotationX(Math.random() * 2 * Math.PI);
    matrix.makeRotationY(Math.random() * 2 * Math.PI);
    matrix.makeRotationZ(Math.random() * 2 * Math.PI);
    // 随机缩放
    matrix.makeScale(
      Math.random() * 0.5 + 0.5,
      Math.random() * 0.5 + 0.5,
      Math.random() * 0.5 + 0.5,
    );
    // 随机位置
    matrix.makeTranslation(
      Math.random() * spaceSize - spaceSize / 2,
      Math.random() * spaceSize - spaceSize / 2,
      Math.random() * spaceSize - spaceSize / 2,
    );
    // 让几体应用不同的变换
    geometry.applyMatrix4(matrix);
    // 保存几何体
    geometries.push(geometry);
  }
  // 得到合并后的几何体
  const mergeGeometry = BufferGeometryUtils.mergeGeometries(geometries);
  const mesh = new THREE.Mesh(mergeGeometry, material);
  scene.add(mesh);
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

  const { calls, triangles } = renderer.info.render;
  console.log(calls, triangles);
  //            2     23793954
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