<!-- 40.纹理_重复_缩放_旋转_位移 -->
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
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import TheCar from '../../components/TheCar.vue';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(1, 2, 6);
scene.add(camera);

// 40.1 添加物体
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./imgs/dog.jpeg');

// // 40.2.1 允许重复
// texture.repeat.set(4, 4);
// // 40.2.2 水平重复 2.镜像重复 1.简单地重复
// texture.wrapS = THREE.MirroredRepeatWrapping; // THREE.RepeatWrapping;
// // 40.2.3 垂直重复
// texture.wrapT = THREE.MirroredRepeatWrapping;

// 40.3 偏移
// texture.offset.set(0.25, 0.25);

// 40.4.1 旋转
texture.rotation = Math.PI / 4;
// 40.4.2 设置中心点
texture.center.set(0.5, 0.5);

const planeGeometry = new THREE.PlaneGeometry(2, 2);
const PlaneMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  map: texture,
});
const plane = new THREE.Mesh(planeGeometry, PlaneMaterial);
scene.add(plane);

// 31.3 设置gui
const gui = new GUI();

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);

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