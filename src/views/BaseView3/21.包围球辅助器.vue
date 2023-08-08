<!-- 21.包围球辅助器 -->
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
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(1, 2, 5);
scene.add(camera);

// 19.1 导入鸭子模型【13.1 实例化加载器gltf】
const gltfLoader = new GLTFLoader();
gltfLoader.load('./model/Duck.glb', gltf => {
  scene.add(gltf.scene);
  // 19.2 获取鸭子
  const duckMesh = gltf.scene.getObjectByName('LOD3spShape');
  // 19.3 获取几何体
  const duckGeometry = duckMesh.geometry;
  // 19.4 计算包围盒（当模型不提供包围盒时，需要调用计算包围盒方法）
  duckGeometry.computeBoundingBox();
  // 20.1 设置几何体居中
  duckGeometry.center();
  // 19.5 拿到包围盒
  const duckBox = duckGeometry.boundingBox;
  // 19.7 更新世界矩阵
  duckMesh.updateWorldMatrix(true, true);
  // 19.8 更新包围盒
  duckBox.applyMatrix4(duckMesh.matrixWorld);
  // 20.2 获取包围盒中心点
  const center = duckBox.getCenter(new THREE.Vector3());
  console.log(center);
  // 19.6 创建包围盒辅助器
  const boxHelper = new THREE.Box3Helper(duckBox, 0xffff00);
  scene.add(boxHelper);

  // 21.1 拿到包围球
  const duckSphere = duckGeometry.boundingSphere;
  duckSphere.applyMatrix4(duckMesh.matrixWorld);
  // 21.2 创建包围球辅助器
  const sphereGeometry = new THREE.SphereGeometry(duckSphere.radius, 16, 16);
  const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true
  });
  const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereMesh.position.copy(duckSphere.center);
  scene.add(sphereMesh);
});

// 19.2【10.1 创建RGBELoader】
const rgbeLoader = new RGBELoader();
rgbeLoader.load('./texture/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = envMap;
  scene.environment = envMap;
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