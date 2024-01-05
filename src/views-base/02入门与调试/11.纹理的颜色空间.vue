<!-- 11.纹理的颜色空间 -->
<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(2, 5, 10);
scene.add(camera);

// 8.2 创建纹理加载器
const textureLoader = new THREE.TextureLoader();
// 8.3 加载纹理
const texture = textureLoader.load('./texture/watercover/CityNewYork002_COL_VAR1_1K.png');
const aoTexture = textureLoader.load('./texture/watercover/CityNewYork002_AO_1K.jpg');
const alphaTexture = textureLoader.load('./texture/door/alpha.jpg');
const lightTexture = textureLoader.load('./texture/colors.png');
const specularTexture = textureLoader.load('./texture/watercover/CityNewYork002_GLOSS_1K.jpg');
// 11.1 修改纹理的颜色空间
texture.colorSpace = THREE.SRGBColorSpace;
// 10.1 创建RGBELoader
const rgbeLoader = new RGBELoader();
// 10.2 加载hdr图
rgbeLoader.load('./texture/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  // 10.3 设置球形映射
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  // 10.4 给场景设置背景
  scene.background = envMap;
  // 10.5 给场景设置环境贴图
  scene.environment = envMap;
  // 10.5 给plane设置环境贴图
  planeMaterial.envMap = envMap;
});
// 8.1 创建平面
const planeGeometry = new THREE.PlaneGeometry(5, 5);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  transparent: true,
  // 10.6 反射强度
  reflectivity: 0.5,
  // 8.4 加载颜色贴图
  map: texture,
  // 8.5 加载环境遮挡贴图
  // aoMap: aoTexture,
  // 9.1 加载透明度贴图
  // alphaMap: alphaTexture,
  // 9.2 加载光照贴图
  // lightMap: lightTexture,
  // 10.7 加载高光贴图
  specularMap: specularTexture,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

const gui = new GUI();
gui.add(planeMaterial, 'aoMapIntensity', 0, 1).name('ao贴图强度');
gui
  .add(texture, 'colorSpace', {
    sRGB: THREE.SRGBColorSpace,
    Linear: THREE.LinearSRGBColorSpace,
  })
  .name('颜色空间')
  .onChange(() => {
    // 11.2 设置纹理需要更新
    texture.needsUpdate = true;
  });

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