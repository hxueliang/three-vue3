<!-- 89.漫天飞舞孔明灯 -->
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
camera.position.set(0, 0, 10);
scene.add(camera);

const gui = new GUI();

// 85.1 创建原始着色器材质【83.2 创建着色器材质】
const shaderMaterial = new THREE.ShaderMaterial({
  // 83.2.1 顶点着色器
  vertexShader: vertexShader,
  // 83.2.2 片元着色器
  fragmentShader: fragmentShader,
  side: THREE.DoubleSide,
  // 86.4.1 设置参数
  uniforms: {},
  // transparent: true,
});

// 89.1 加载环境纹理
const rgbeLoader = new RGBELoader();
rgbeLoader.loadAsync('./hdr/2k.hdr').then(texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});
// 89.3 加载孔明灯贴图
let lightBox = null;
const gltfLoader = new GLTFLoader();
gltfLoader.load('./model/flylight/flyLight.glb', gltf => {
  lightBox = gltf.scene.children[0];
  lightBox.material = shaderMaterial;
  toRotation(gltf.scene.rotation);
  toPosition(gltf.scene.position, 1.5, 0, 5, 0);
  scene.add(gltf.scene);

  for (let i = 0; i < 60; i++) {
    let flyLight = gltf.scene.clone(true);
    let x = (Math.random() - 0.5) * 300; // -150 ~ 150
    let z = (Math.random() - 0.5) * 300;
    let y = Math.random() * 60 + 20; // 25 ~ 85
    flyLight.position.set(x, y, z);
    toRotation(flyLight.rotation);
    toPosition(flyLight.position);
    scene.add(flyLight);
  }
});
// 89.4 灯y轴旋转
function toRotation(obj, defaultN = 10, randomN = 30) {
  gsap.to(obj, {
    y: 2 * Math.PI,
    duration: defaultN + Math.random() * randomN,
    ease: "power2.inOut",
    repeat: -1,
  });
}
// 89.5 灯位移
function toPosition(obj, defaultN = 10, randomN = 20, defaultTime = 5, randomTime = 10) {
  gsap.to(obj, {
    x: `+=${Math.random() * 5}`,
    y: `+=${defaultN + Math.random() * randomN}`,
    yoyo: true,
    duration: defaultTime + Math.random() * randomTime,
    repeat: -1,
  });
}

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
// 89.1.1 色调映射
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// 89.2.2 色调映射的曝光级别
renderer.toneMappingExposure = 0.2;

renderer.setSize(innerWidth, innerHeight);
// 75.2.2 允许在场景中使用阴影贴图
renderer.shadowMap.enabled = true;

// 1.6 创建控制器
let cantrols = null;
function createControls() {
  cantrols = new OrbitControls(camera, container.value);
  cantrols.enableDamping = true;
  cantrols.dampingFactor = 0.05; // 阻尼：值越大惯性越小，0不能动
  cantrols.autoRotate = true; // 自动围绕目标旋转
  cantrols.autoRotateSpeed = 0.4; // 围绕目标旋转的速度将有多快，默认值为2.0，相当于在60fps时每旋转一周需要30秒。
  cantrols.maxPolarAngle = Math.PI / 4 * 3;
  cantrols.minPolarAngle = Math.PI / 4 * 3;
}

// 1.7 添加坐标轴辅助器
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// 设置时钟
const clock = new THREE.Clock();

// 1.5 创建渲染函数
function render() {
  const elapsedTime = clock.getElapsedTime();

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