<!-- 67.颜色收敛_旋臂渐变 -->
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
camera.position.set(0, 3, 12);
scene.add(camera);

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);

// 64.1 初始化数据
const params = {
  count: 50000,
  size: 0.1,
  radius: 5,
  branch: 4,
  // 67.1 设置圆心为亮红色，边缘为亮蓝色，用于从红色过渡到蓝色
  color: '#ff6030',
  endColor: '#1b3984',
  bend: 0.3, // 控制弯曲程度
};
let particlesGeometry = null;
let pointsMaterial = null;
let points = null;
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load(`./texture/particles/1.png`);

// 67.3 初始化中心颜色 边缘颜色
const centerColor = new THREE.Color(params.color);
const endColor = new THREE.Color(params.endColor);

// 64.2 创建星系
function createGalaxy() {
  particlesGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(params.count * 3);
  // 67.2 创建顶点颜色数组
  const colors = new Float32Array(params.count * 3);
  for (let i = 0; i < params.count; i++) {
    // 65.1 分支角度 = 第几条分支 * 角度
    const barnch = i % params.branch;
    const angle = 2 * Math.PI / params.branch;
    const barnchAngle = barnch * angle;
    // 66.4 0到1再做3次方,实现圆心密集【65.2 当前点距离圆心的位置】
    const r = Math.random() * params.radius * Math.pow(Math.random(), 3);
    const current = i * 3;
    // 66.5 乘上(radius-r)*0.2,实现圆心厚边缘薄【66.3.1 -1到1再做3次方,实现线中心密集】【66.2.1 让点在曲线附近散开】
    const randomX = Math.pow(Math.random() * 2 - 1, 3) * (params.radius - r) * 0.2;
    const randomY = Math.pow(Math.random() * 2 - 1, 3) * (params.radius - r) * 0.2;
    const randomZ = Math.pow(Math.random() * 2 - 1, 3) * (params.radius - r) * 0.2;
    // 66.2.2 加上随机值【66.1.1 角度值加上距离实现直线弯曲】【65.3.1 修改x值】
    positions[current] = Math.cos(barnchAngle + r * params.bend) * r + randomX;
    // 66.2.3 加上随机值
    positions[current + 1] = 0 + randomY;
    // 66.2.4 加上随机值 【66.1.1 角度值加上距离实现直线弯曲】【65.3.2 修改y值】
    positions[current + 2] = Math.sin(barnchAngle + r * params.bend) * r + randomZ;
    // 67.4 混合颜色，形成渐变色
    const mixColor = centerColor.clone();
    mixColor.lerp(endColor, r / params.radius);
    colors[current] = mixColor.r;
    colors[current + 1] = mixColor.g;
    colors[current + 2] = mixColor.b;
  }
  particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  );
  // 67.6 设置颜色属性
  particlesGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
  );
  pointsMaterial = new THREE.PointsMaterial({
    // 67.7 取消原来的颜色，避免混合颜色时，此颜色值变重，影响混合效果
    // color: new THREE.Color(params.color),
    size: params.size,
    sizeAttenuation: true,
    map: texture,
    alphaMap: texture,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    // 67.5 是否使用顶点着色
    vertexColors: true,
  });
  points = new THREE.Points(particlesGeometry, pointsMaterial);
  scene.add(points);
}
createGalaxy();

// 10.1 创建RGBELoader
// const rgbeLoader = new RGBELoader();
// // 10.2 加载hdr图;
// rgbeLoader.load('./texture/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
//   envMap.mapping = THREE.EquirectangularReflectionMapping;
//   scene.background = envMap;
//   scene.environment = envMap;
// });

const gui = new GUI();


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