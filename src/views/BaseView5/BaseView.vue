<!-- 51.裁剪平面 -->
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

// 51.1 创建物体
const geometry = new THREE.SphereGeometry(15, 32, 16);
const material = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  wireframe: true,
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// 51.2 创建裁剪平面
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
// 51.2.1 创建裁剪平面
const plane1 = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
// 51.3 裁剪平面集合
material.clippingPlanes = [plane, plane1];
// 51.3.1 场景里所有物体都相同的 裁剪平面集合
// renderer.clippingPlanes = [plane, plane1];
// 51.7 设置裁剪为并集，默认：false，即交集
material.clipIntersection = true;
// 51.4 渲染器是否考虑对象级剪切平面
renderer.localClippingEnabled = true;
// 51.5 原点到平面有符号距离
plane.constant = 0;
// 51.8 设置裁剪阴影（配合灯光使用）
material.clipShadows = true;
// 51.6 gui
const folder = gui.addFolder('裁剪平面');
folder.add(plane, 'constant', -14.6, 14.6).step(0.1).name('位置');
folder.add(plane.normal, 'x', -1, 1).step(0.5).name('法向量x');
folder.add(plane.normal, 'y', -1, 1).step(0.5).name('法向量y');
folder.add(plane.normal, 'z', -1, 1).step(0.5).name('法向量z');

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