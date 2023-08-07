<!-- 16.uv与应用 -->
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
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(1, 2, 15);
scene.add(camera);

// 16.2 加载uv纹理
const uvTexture = new THREE.TextureLoader().load('./texture/uv_grid_opengl.jpg');
// 16.1 创建平面
const planeGeometry = new THREE.PlaneGeometry(2, 2);
const planeMaterial = new THREE.MeshBasicMaterial({ map: uvTexture });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.x = -2;
scene.add(plane);
// 16.3 手动创建手几何体
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
  -1, -1, 0, // 一个几何体顶点三个坐标
  1, -1, 0,
  1, 1, 0,
  -1, 1, 0
]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3)); // 三个一组
const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
geometry.setIndex(new THREE.BufferAttribute(indices, 1));
// 16.3.1 设置uv坐标
const uv = new Float32Array([
  0, 0, // 一个uv顶点二个坐标
  1, 0,
  1, 1,
  0, 1
]);
// 16.3.2 创建uv属性
geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); // 二个一组
const material = new THREE.MeshBasicMaterial({ map: uvTexture });
const cube = new THREE.Mesh(geometry, material);
cube.position.x = 2;
scene.add(cube);

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer();
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