<!-- 62.顶点颜色_多彩星空 -->
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
camera.position.set(0, 3, 5);
scene.add(camera);

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);

// 10.1 创建RGBELoader
// const rgbeLoader = new RGBELoader();
// // 10.2 加载hdr图;
// rgbeLoader.load('./texture/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
//   envMap.mapping = THREE.EquirectangularReflectionMapping;
//   scene.background = envMap;
//   scene.environment = envMap;
// });

const gui = new GUI();

// 62.1 自定义几何体
const particlesGeometry = new THREE.BufferGeometry();
const count = 5000;
// 62.2 设置缓冲区数组
const positions = new Float32Array(count * 3);
// 62.5 设置顶点颜色
const colors = new Float32Array(count * 3);
// 62.3 设置顶点
for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 200;
  colors[i] = Math.random();
}
particlesGeometry.setAttribute(
  'position',
  new THREE.BufferAttribute(positions, 3)
);
particlesGeometry.setAttribute(
  'color',
  new THREE.BufferAttribute(colors, 3)
);

// 60.1 创建球几何体
// const spheregeometry = new THREE.SphereGeometry(3, 30, 30);
// 61.3.2 解决纹理加载异常的问题
// delete spheregeometry.attributes.uv;
// 60.2 创建点材质
const pointsMaterial = new THREE.PointsMaterial();
// 60.3 设置点材质的大小
pointsMaterial.size = 1;

// 61.1 设置点材质的颜色
pointsMaterial.color.set(0xfff000);
// 61.2 是否应相机深度而衰减
pointsMaterial.sizeAttenuation = true;
// 61.3.1 设置纹理
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./texture/particles/1.png');
pointsMaterial.map = texture;
pointsMaterial.alphaMap = texture;
pointsMaterial.transparent = true;
pointsMaterial.depthWrite = false;
pointsMaterial.blending = THREE.AdditiveBlending;
// 62.6 启用顶点颜色设置
pointsMaterial.vertexColors = true;

// 62.4 生成物体【60.4 创建点物体】
const points = new THREE.Points(particlesGeometry, pointsMaterial);
scene.add(points);

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

// 设置时钟
const clock = new THREE.Clock();

// 1.5 创建渲染函数
function render() {
  const time = clock.getElapsedTime();
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