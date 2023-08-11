<!-- 59.让点光源小球动起来 -->
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
import gsap from 'gsap';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(1, 5, 10);
scene.add(camera);

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
// 56.3 开启渲染器阴影
renderer.shadowMap.enabled = true;

// 10.1 创建RGBELoader
const rgbeLoader = new RGBELoader();
// 10.2 加载hdr图
rgbeLoader.load('./texture/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = envMap;
  // 56.7 取消环境贴图，太亮，影响阴影
  // scene.environment = envMap;
});

const gui = new GUI();

// 56.1 添加球体
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const material = new THREE.MeshStandardMaterial();
const sphere = new THREE.Mesh(sphereGeometry, material);
// 56.5 开启物体投射阴影
sphere.castShadow = true;
scene.add(sphere);

// 56.2 添加平面
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const plane = new THREE.Mesh(planeGeometry, material);
plane.position.y = -1;
plane.rotation.x = -Math.PI / 2;
// 56.6 开启物体接收阴影
plane.receiveShadow = true;
scene.add(plane);

// 58.0 添加 环境光
const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

// 58.1 添加 点光源
const pointLight = new THREE.PointLight(0xff0000, 4);

// 58.2 创建小球
const lightBall = new THREE.Mesh(
  new THREE.SphereGeometry(0.05, 20, 20),
  new THREE.MeshBasicMaterial({ color: 0xff0000 }),
);
scene.add(lightBall);

// 58.3 将点光源添加到小球上
lightBall.add(pointLight);
lightBall.position.set(2, 2, 2);

// 58.0 模糊阴影的边缘
pointLight.shadow.radius = 20;
pointLight.shadow.mapSize.set(4096, 4096);

// 58.4 gui
gui.add(lightBall.position, 'x').min(-5).max(5).step(0.1);

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

// 59.1 设置时钟
const clock = new THREE.Clock();

// 1.5 创建渲染函数
function render() {
  // 59.2 获取当前动画运行时间
  const time = clock.getElapsedTime();
  lightBall.position.x = Math.sin(time) * 2;
  lightBall.position.z = Math.cos(time) * 2;
  lightBall.position.y = 2 + Math.sin(time * 10) / 5;

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