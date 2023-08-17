<!-- 96.让顶点旋转 -->
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
camera.position.set(2, 5, 3);
scene.add(camera);

const gui = new GUI();

// 92.3.1 加载纹理
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./texture/particles/1.png');
const texture2 = textureLoader.load('./texture/particles/14.png');
const texture3 = textureLoader.load('./texture/particles/xh.png');

// 64.1 初始化数据
const params = {
  count: 1000,
  size: 0.1,
  radius: 5,
  branch: 4,
  // 67.1 设置圆心为亮红色，边缘为亮蓝色，用于从红色过渡到蓝色
  color: '#ff6030',
  endColor: '#1b3984',
  bend: 0.3, // 控制弯曲程度
};

// 67.3 初始化中心颜色 边缘颜色
const centerColor = new THREE.Color(params.color);
const endColor = new THREE.Color(params.endColor);

// 94.1.0 定义全局变量
let geometry = null;
let material = null;
let points = null;

// 64.2 创建星系
function createGalaxy() {

  // 94.1.1 如果已经存在这些顶点，先释放内存，在删除顶点数据
  if (points) {
    geometry.dispose();
    material.dispose();
    scene.remove(points);
  }

  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(params.count * 3);
  // 67.2 创建顶点颜色数组
  const colors = new Float32Array(params.count * 3);
  // 94.2.2 图案
  const imgIndex = new Float32Array(params.count);
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

    // 94.2.1 根据索引值设置不同的图案
    imgIndex[current] = (current / 3) % 3; // current: 0 3 6 9 -> 0,1,2
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  // 67.6 设置颜色属性
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // console.log(new THREE.BufferAttribute(imgIndex, 1));
  // 94.2.3.1 设置imgIndex
  geometry.setAttribute('imgIndex', new THREE.BufferAttribute(imgIndex, 1));

  // 94.1.2 创建材质
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,

    // 94.1.2.1 增加这3个属性
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,

    uniforms: {
      uTexture: {
        value: texture
      },
      uTexture2: {
        value: texture2
      },
      uTexture3: {
        value: texture3
      },
      uTime: {
        value: 0
      },
    }
  });

  points = new THREE.Points(geometry, material);
  scene.add(points);
}
createGalaxy();

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
  const elapsedTime = clock.getElapsedTime();

  // 96.1.1 设置uTime
  material.uniforms.uTime.value = elapsedTime;

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