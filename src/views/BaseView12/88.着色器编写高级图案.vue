<!-- 88.着色器编写高级图案 -->
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

import deepVertexShader from "../../shader/deep/vertex.glsl?raw";
import deepFragmentShader from '../../shader/deep/fragment.glsl?raw';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 300);
camera.position.set(0, 0, 2);
scene.add(camera);

const gui = new GUI();

// 86.5.1 加载纹理
const textureLoader = new THREE.TextureLoader();
const textrue = textureLoader.load('./imgs/ca.jpeg');

const params = {
  uFrequency: 10,
  uScale: 0.1,
};

// 85.1 创建原始着色器材质【83.2 创建着色器材质】
const rowShaderMaterial = new THREE.RawShaderMaterial({
  // 83.2.1 顶点着色器
  vertexShader: deepVertexShader,
  // 83.2.2 片元着色器
  fragmentShader: deepFragmentShader,
  side: THREE.DoubleSide,
  // 86.4.1 设置参数
  uniforms: {
    // 波浪的频率
    uFrequency: {
      value: params.uFrequency,
    },
    // 波浪的幅度
    uScale: {
      value: params.uScale,
    },
    uTime: {
      value: 0,
    },
    // 86.5.2 添加纹理参数
    uTextrue: {
      value: textrue,
    }
  }
});
// 83.1 创建平面
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1, 64, 64),
  rowShaderMaterial
);
scene.add(plane);

gui
  .add(params, "uFrequency")
  .min(0)
  .max(50)
  .step(0.1)
  .onChange((value) => {
    rowShaderMaterial.uniforms.uFrequency.value = value;
  });
gui
  .add(params, "uScale")
  .min(0)
  .max(1)
  .step(0.01)
  .onChange((value) => {
    rowShaderMaterial.uniforms.uScale.value = value;
  });

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(innerWidth, innerHeight);
// 75.2.2 允许在场景中使用阴影贴图
renderer.shadowMap.enabled = true;

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
  // 86.4.2 设置uTime的值
  rowShaderMaterial.uniforms.uTime.value = elapsedTime;
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