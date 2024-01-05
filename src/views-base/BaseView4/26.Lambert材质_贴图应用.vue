<!-- 26.Lambert材质_贴图应用 -->
<!-- 一种非光泽表面的材质 -->
<!-- 例如未经处理的木材或石材 -->
<!-- THREE.MeshLambertMaterial -->
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
camera.position.set(0.5, 1, 0.5);
scene.add(camera);

// 26.1 加载环境贴图 【10.1 创建RGBELoader】
const rgbeLoader = new RGBELoader();
rgbeLoader.load('./texture/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = envMap;
  scene.environment = envMap;
  planeMaterial.envMap = envMap;
});

// 26.3 添加环境光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// 26.4 添加点光源
const pointLight = new THREE.PointLight(0xffffff, 2);
pointLight.position.y = 2;
scene.add(pointLight);

// 26.5 添加纹理贴图
const textureLoader = new THREE.TextureLoader();
const colorTexture = textureLoader.load('./texture/watercover/CityNewYork002_COL_VAR1_1K.png');
colorTexture.colorSpace = THREE.SRGBColorSpace;
const specularTexture = textureLoader.load('./texture/watercover/CityNewYork002_GLOSS_1K.jpg');
const normalTexture = textureLoader.load('./texture/watercover/CityNewYork002_NRM_1K.jpg');
const dispTexture = textureLoader.load('./texture/watercover/CityNewYork002_DISP_1K.jpg');
const aoTexture = textureLoader.load('./texture/watercover/CityNewYork002_AO_1K.jpg');

// 26.2 创建平面【8.1 创建平面】
const planeGeometry = new THREE.PlaneGeometry(1, 1, 200, 200); // 26.5.5.1 长宽都设置200个顶点
const planeMaterial = new THREE.MeshLambertMaterial({
  transparent: true,
  // 10.6 反射强度
  reflectivity: 0.5,
  // 26.5.1 颜色贴图
  map: colorTexture,
  // 26.5.2 高光贴图
  specularMap: specularTexture,
  // 26.5.3 法线贴图
  // normalMap: normalTexture,
  // 26.5.4 凹凸贴图
  bumpMap: dispTexture,
  // 26.5.5 置换贴图
  displacementMap: dispTexture,
  // 26.5.5.2 置换程度
  displacementScale: 0.02,
  // 26.5.6 环境光遮挡贴图
  aoMap: aoTexture,
  // 9.1 加载透明度贴图
  // alphaMap: alphaTexture,
  // 9.2 加载光照贴图
  // lightMap: lightTexture,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = - Math.PI / 2;
scene.add(plane);

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