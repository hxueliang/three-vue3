<!-- 31.透明物体_透光性_厚度_衰减颜色_衰减距离 -->
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
import { TextureLoader } from 'three';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(1, 2, 3);
scene.add(camera);

// 31.1 加载环境贴图【10.1 创建RGBELoader】
const rgbeLoader = new RGBELoader();
rgbeLoader.load('./texture/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = envMap;
  scene.environment = envMap;
});

// 31.2.6 加载厚度贴图
const thicknessMap = new THREE.TextureLoader().load('./texture/diamond/diamond_emissive.png');

// 31.2 创建物体
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhysicalMaterial({
  transparent: true,
  // 31.2.1 透光性
  transmission: 0.95,
  // 31.2.2 粗糙度
  roughness: 0.05,
  // 31.2.3 厚度
  thickness: 2,
  // 31.2.4 衰减颜色
  attenuationColor: new THREE.Color(0.9, 0, 0.9),
  // 31.2.5 衰减距离
  attenuationDistance: 1,
  // 31.2.6.1 厚度贴图
  thicknessMap: thicknessMap
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 31.3 设置gui
const gui = new GUI();
gui.add(cube.material, 'attenuationDistance', 0, 1).name('衰减距离');
gui.add(cube.material, 'thickness', 0, 2).name('厚度');


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