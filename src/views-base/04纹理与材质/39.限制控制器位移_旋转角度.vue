<!-- 39.限制控制器位移_旋转角度 -->
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
// 39.2 修改相机位置
camera.position.set(-2.5, 1, 0);
camera.lookAt(0, 1, 0);
scene.add(camera);

// 39.1 导入模型
scene.background = new THREE.Color(0x7aaff5);
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./draco/');
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load('./model/livingroom.glb', gltf => {
  gltf.scene.rotation.set(0, Math.PI, 0);
  scene.add(gltf.scene);
});

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

  // 39.3 禁用平移（不禁用可通过：shith + 鼠标，平移）
  cantrols.enablePan = false;
  // 39.4 设置目标
  cantrols.target.set(0, 1, 0);
  // 39.5.1 设置移目标最小距离
  cantrols.minDistance = 1;
  // 39.5.2 设置移目标最大距离
  cantrols.maxDistance = 3;
  // 39.6.1 设置垂直最小角度
  cantrols.minPolarAngle = Math.PI / 2 - Math.PI / 12;
  // 39.6.2 设置垂直最大角度
  cantrols.maxPolarAngle = Math.PI / 2 + Math.PI / 12;
  // 39.7.1 设置水平最小角度
  cantrols.minAzimuthAngle = -Math.PI / 2 - Math.PI / 12;
  // 39.7.2 设置水平最大角度
  cantrols.maxAzimuthAngle = -Math.PI / 2 + Math.PI / 12;


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