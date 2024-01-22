<!-- 75.入门cannon -->
<!-- https://pmndrs.github.io/cannon-es/ -->
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


let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 300);
camera.position.set(1, 3, 10);
scene.add(camera);

const gui = new GUI();

// 75.1.1 创建球体
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial();
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// 75.1.2 创建平面
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial()
);
floor.position.y = -5;
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// 75.1.3 设置灯光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
scene.add(ambientLight);
scene.add(dirLight);

// 75.2.1 灯光投射阴影
dirLight.castShadow = true;
// 75.2.3 小球投射阴影
sphere.castShadow = true;
// 75.2.4 地板接收阴影
floor.receiveShadow = true;

// 75.3 创建物理世界
const world = new CANNON.World();
world.gravity.set(0, -9.8, 0);
// 75.4 创建小球形状
const sphereShape = new CANNON.Sphere(1);
// 75.5 创建物理世界的物体
const sphereBody = new CANNON.Body({
  // 75.5.1 形状
  shpae: sphereShape,
  // 75.5.2 位置
  position: new CANNON.Vec3(0, 0, 0),
  // 75.5.3 重量
  mass: 1,
  // 75.5.4 材质
  material: new CANNON.Material(),
});
// 75.6 将物体添加到世界
world.addBody(sphereBody);


// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.outputColorSpace = THREE.SRGBColorSpace;
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
  const deltaTime = clock.getDelta();

  // 75.7 更新物理引擎世界里的物体
  world.step(1 / 60, deltaTime);
  // 75.8 浸染引擎的物体位置，复制物理引擎的物体位置
  sphere.position.copy(sphereBody.position);

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