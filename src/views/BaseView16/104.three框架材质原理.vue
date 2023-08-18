<!-- 104.three框架材质原理 -->
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

import vertexShader from "../../shader/flylight/vertex.glsl?raw";
import fragmentShader from '../../shader/flylight/fragment.glsl?raw';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 300);
camera.position.set(3, 5, 6);
scene.add(camera);

const gui = new GUI();


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
  cantrols.dampingFactor = 0.05;
}

// 1.7 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 设置时钟
const clock = new THREE.Clock();

// 104.0 创建平面
const planeGeometry = new THREE.PlaneGeometry(1, 1);
const planeMaterail = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  side: THREE.DoubleSide,
});

// 104.3.1 定义传给着色器的参数
const basicUnifrom = {
  uTime: {
    value: 0
  }
};

// 104.1 在编译shader程序之前立即执行的可选回调
planeMaterail.onBeforeCompile = (shader, renderer) => {
  console.log(shader.vertexShader);
  console.log(shader.fragmentShader);

  // 104.3.2 传参
  shader.uniforms.uTime = basicUnifrom.uTime;
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `
    #include <common>
    
    // 104.3.3 接参
    uniform float uTime;
    `
  );

  // 104.2 修改默认的顶点着色器
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
    #include <begin_vertex>
    
    // transformed.xyz += 2.0;

    // 104.3.4 用参
    transformed.x += sin(uTime) * 2.0;
    transformed.y += cos(uTime) * 1.0;
    `
  );
};

const plane = new THREE.Mesh(planeGeometry, planeMaterail);
scene.add(plane);

// 1.5 创建渲染函数
function render() {
  const elapsedTime = clock.getElapsedTime();

  // 104.3.5 改参
  basicUnifrom.uTime.value = elapsedTime;

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