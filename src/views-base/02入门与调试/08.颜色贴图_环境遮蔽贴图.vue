<!-- 8.颜色贴图_环境遮蔽贴图 -->
<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(2, 5, 10);
scene.add(camera);

// 8.2 创建纹理加载器
const textureLoader = new THREE.TextureLoader();
// 8.3 加载纹理
const texture = textureLoader.load('./texture/watercover/CityNewYork002_COL_VAR1_1K.png');
const aoTexture = textureLoader.load('./texture/watercover/CityNewYork002_AO_1K.jpg');
// 8.1 创建平面
const planeGeometry = new THREE.PlaneGeometry(5, 5);
const PlaneMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  // 8.3.1 加载颜色贴图
  map: texture,
  // 8.3.1 加载环境遮挡贴图
  aoMap: aoTexture,
});
const plane = new THREE.Mesh(planeGeometry, PlaneMaterial);
scene.add(plane);

const gui = new GUI();
gui.add(PlaneMaterial, 'aoMapIntensity', 0, 1).name('ao贴图强度');

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);

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