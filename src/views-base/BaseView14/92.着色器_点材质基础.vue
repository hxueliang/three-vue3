<!-- 92.着色器_点材质基础 -->
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
import { BufferGeometry, PointsMaterial } from 'three';

import vertexShader from "../../shader/point/vertex.glsl?raw";
import fragmentShader from '../../shader/point/fragment.glsl?raw';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 300);
camera.position.set(1, 2, 40);
scene.add(camera);

const gui = new GUI();

// 92.1 创建几何体
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array([0, 0, 0]);
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// 92.2.1 创建点材质
// const material = new THREE.PointsMaterial({
//   color: 0xff0000,
//   size: 10,
//   sizeAttenuation: true,
// });
// 92.2.2 创建点着色器材质
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
});
// 92.3 生成点
const points = new THREE.Points(geometry, material);
scene.add(points);

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(innerWidth, innerHeight);

// 1.6 创建控制器
let cantrols = null;
function createControls() {
  cantrols = new OrbitControls(camera, container.value);
  cantrols.enableDamping = true;
  cantrols.dampingFactor = 0.05; // 阻尼：值越大惯性越小，0不能动
}

// 1.7 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 设置时钟
const clock = new THREE.Clock();

// 1.5 创建渲染函数
function render() {
  const elapsedTime = clock.getDelta();

  cantrols && cantrols.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

// 4.1 监听视口变化
window.addEventListener('resize', () => {
  const innerWidth = window.innerWidth;
  const innerHeight = window.innerHeight;
  // 更新渲染器大小
  renderer.setSize(innerWidth, innerHeight);
  // 更新摄像头宽高比
  camera.aspect = innerWidth / innerHeight;
  // 更新摄像头投影矩阵
  camera.updateProjectionMatrix();
});

onMounted(() => {
  container.value.appendChild(renderer.domElement);
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