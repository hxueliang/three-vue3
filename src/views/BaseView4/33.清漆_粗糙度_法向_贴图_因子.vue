<!-- 33.清漆_粗糙度_法向_贴图_因子 -->
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
// 33.5.1 清漆法向贴图
const normalMap = new THREE.TextureLoader().load('./texture/diamond/diamond_normal.png');

// 31.2 创建物体
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhysicalMaterial({
  transparent: true,
  color: 0xffff00,
  roughness: 0.5,
  // 33.1 清漆
  clearcoat: 1,
  // 33.2 清漆粗糙度
  clearcoatRoughness: 0,
  // 33.3 清漆贴图
  // clearcoatMap: thicknessMap,
  // 33.4 清漆粗糙度贴图
  // clearcoatRoughnessMap: thicknessMap,
  // 33.5.2 清漆法向贴图
  clearcoatNormalMap: normalMap,
  // 33.5.3 法向贴图
  normalMap: normalMap,
  // 33.5.4 清漆法向影响因子（衡量.clearcoatNormalMap影响）
  clearcoatNormalScale: new THREE.Vector2(0.5, 0.5),
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 31.3 设置gui
const gui = new GUI();
gui.add(cube.material, 'attenuationDistance', 0, 1).name('衰减距离');
gui.add(cube.material, 'thickness', 0, 2).name('厚度');
// 32.1 折射率
gui.add(cube.material, 'ior', 0, 2).name('折射率');
// 32.2 反射率
gui.add(cube.material, 'reflectivity', 0, 1).name('反射率');


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