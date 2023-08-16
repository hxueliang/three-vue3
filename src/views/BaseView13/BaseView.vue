<!-- 90.着色器打造烟雾水云效果 -->
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

import vertexShader from "../../shader/water/vertex.glsl?raw";
import fragmentShader from '../../shader/water/fragment.glsl?raw';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 300);
camera.position.set(0, 1, 1);
scene.add(camera);

const gui = new GUI();

// 90.4.1 水纹控制属性
const params = {
  uWaterFrequency: 14, // 水波纹频率
  uScale: 0.03, // 水波纹大小
  uNoiseFrequency: 16, // 噪声频率
  uNoiseScale: 0.5, // 噪声大小
  uXzScale: 1.6,// 
  uLowColor: '#ff0000',
  uHighColor: '#ffff00',
  uXspeed: 1, // X水流速度
  uZspeed: 1, // Z水流速度
  uNoiseSpeed: 1,
  uOpacity: 1,
};
// 90.4.2 设置gui
gui.add(params, 'uWaterFrequency').min(1).max(100).step(0.1).onChange(value => {
  shaderMaterial.uniforms.uWaterFrequency.value = value;
});
gui.add(params, 'uScale').min(0).max(0.2).step(0.001).onChange(value => {
  shaderMaterial.uniforms.uScale.value = value;
});
gui.add(params, 'uNoiseFrequency').min(1).max(100).step(0.1).onChange(value => {
  shaderMaterial.uniforms.uNoiseFrequency.value = value;
});

gui.add(params, 'uNoiseScale').min(0).max(5).step(0.001).onChange(value => {
  shaderMaterial.uniforms.uNoiseScale.value = value;
});
gui.add(params, 'uXzScale').min(0).max(5).step(0.1).onChange(value => {
  shaderMaterial.uniforms.uXzScale.value = value;
});

gui.addColor(params, 'uLowColor').onChange(value => {
  shaderMaterial.uniforms.uLowColor.value = new THREE.Color(value);
});
gui.addColor(params, 'uHighColor').onChange(value => {
  shaderMaterial.uniforms.uHighColor.value = new THREE.Color(value);
});



gui.add(params, 'uXspeed').min(0).max(5).step(0.1).onChange(value => {
  shaderMaterial.uniforms.uXspeed.value = value;
});
gui.add(params, 'uZspeed').min(0).max(5).step(0.1).onChange(value => {
  shaderMaterial.uniforms.uZspeed.value = value;
});
gui.add(params, 'uNoiseSpeed').min(0).max(5).step(0.1).onChange(value => {
  shaderMaterial.uniforms.uNoiseSpeed.value = value;
});
gui.add(params, 'uOpacity').min(0).max(1).step(0.01).onChange(value => {
  shaderMaterial.uniforms.uOpacity.value = value;
});

// 90.2.1 自定义材质
const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  side: THREE.DoubleSide,
  transparent: true,
  uniforms: {
    uWaterFrequency: {
      value: params.uWaterFrequency
    },
    uScale: {
      value: params.uScale
    },
    uNoiseFrequency: {
      value: params.uNoiseFrequency
    },
    uNoiseScale: {
      value: params.uNoiseScale
    },
    uXzScale: {
      value: params.uXzScale
    },
    uTime: {
      value: 0
    },
    uLowColor: {
      value: new THREE.Color(params.uLowColor)
    },
    uHighColor: {
      value: new THREE.Color(params.uHighColor)
    },
    uXspeed: {
      value: params.uXspeed
    },
    uZspeed: {
      value: params.uZspeed
    },
    uNoiseSpeed: {
      value: params.uNoiseSpeed
    },
    uOpacity: {
      value: params.uOpacity
    },
  },
});

// 90.1 创建平面
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1, 1024, 1024),
  // 90.2.2 使用自定义材质
  shaderMaterial,
);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

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
  shaderMaterial.uniforms.uTime.value = elapsedTime;

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