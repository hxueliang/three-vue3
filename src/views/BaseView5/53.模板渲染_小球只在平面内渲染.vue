<!-- 53.模板渲染_小球只在平面内渲染 -->
<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as THREE from 'three';
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
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(1, 2, 30);
scene.add(camera);

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);

// 10.1 创建RGBELoader
const rgbeLoader = new RGBELoader();
// 10.2 加载hdr图
rgbeLoader.load('./texture/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = envMap;
  scene.environment = envMap;
});

const gui = new GUI();

// 53.1 创建平面
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshPhysicalMaterial({
  side: THREE.DoubleSide,
  // 53.3.1 两个物体都设置模板缓冲区的写入和测试
  stencilWrite: true,
  // 53.4.1 两个物体都设置相同的模板缓冲基准值
  stencilRef: 2,
  // 53.5 模板设置设置允许写入的掩码0xff（0-255）
  stencilWriteMask: 0xff,
  // 53.7 模板函数比较通过时候，设置为replace替换
  stencilZPass: THREE.ReplaceStencilOp,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

// 53.2 创建小球
const geometry = new THREE.SphereGeometry(1, 20, 20);
const material = new THREE.MeshPhysicalMaterial({
  color: 0xffcccc,
  // 53.3.2 两个物体都设置模板缓冲区的写入和测试
  stencilWrite: true,
  // 53.4.2 两个物体都设置相同的模板缓冲基准值
  stencilRef: 2,
  // 53.6 小球上设置模板比较函数THREE.EqualStencilFunc
  stencilFunc: THREE.EqualStencilFunc,
  // 53.8.2 配合小球在平面后时，不做深度验证，使小球能渲染出来
  depthTest: false,
});
const sphere = new THREE.Mesh(geometry, material);
// 53.8.0 小球位置在平面前面
// sphere.position.z = 2;
// 53.8.1 修改小球位置在平面后面
sphere.position.z = -2;
scene.add(sphere);

// 53.8.2 测试小球在平面前后进动
gui.add(sphere.position, 'z', -10, 10);

// 1.6 创建控制器
let cantrols = null;
function createControls() {
  cantrols = new OrbitControls(camera, container.value);
  cantrols.enableDamping = true;
  cantrols.dampingFactor = 0.05; // 阻尼：值越大惯性越小，0不能动

  container.value.appendChild(renderer.domElement);
}

// 1.7 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);


// 1.5 创建渲染函数
function render() {
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
  createControls();
  render();
});
</script>

<style scope>
.container {
  width: 100vw;
  height: 100vh;
  background-color: #f0f0f0;
}
</style>