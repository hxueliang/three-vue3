<!-- 54.模板渲染实现金属剖切面 -->
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
camera.position.set(9, 20, 30);
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

// 54.1 创建两个相同形状的物体（一个显示前面，另一个显示后面）
const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
const frontMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.FrontSide,
});
const backMaterial = new THREE.MeshBasicMaterial({
  color: 0xff00ff,
  side: THREE.BackSide,
  // 54.4.1 设置渲染模板相关参数
  stencilWrite: true,
  stencilRef: 2,
  stencilWriteMask: 0xff,
  stencilZPass: THREE.ReplaceStencilOp,
});
const frontMesh = new THREE.Mesh(geometry, frontMaterial);
const backMesh = new THREE.Mesh(geometry, backMaterial);
scene.add(frontMesh);
scene.add(backMesh);

// 54.2 创建裁剪平面，并给前后两物体添加裁剪平面
const plane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
frontMaterial.clippingPlanes = [plane];
backMaterial.clippingPlanes = [plane];
renderer.localClippingEnabled = true;
plane.constant = 0;

// 54.3 创建金属平面
const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x6090e0,
  metalness: 0.95,
  roughness: 0.1,
  // 54.4.2 设置物体要渲染到模板相关参数
  stencilWrite: true,
  stencilRef: 2,
  stencilFunc: THREE.EqualStencilFunc,
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
planeMesh.rotation.x = -Math.PI / 2;
scene.add(planeMesh);

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