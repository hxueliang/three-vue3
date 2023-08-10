<!-- 48.材质_深度模式_深度测试_深度写入_渲染顺序 -->
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
camera.position.set(1, 2, 12);
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

// 48.1 创建两个平面
function createPlane(url) {
  const planeGeometry = new THREE.PlaneGeometry(10, 10);
  const planeMaterial = new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load(url),
    transparent: true,
    side: THREE.DoubleSide,
  });
  return new THREE.Mesh(planeGeometry, planeMaterial);
}
const plane = createPlane('./texture/sprite0.png');
const plane1 = createPlane('./texture/lensflare0_alpha.png');
plane1.position.z = 3;
scene.add(plane);
scene.add(plane1);

// 48.2 设置材质模式
const gui = new GUI();
const folder = gui.addFolder('plane红');
// 48.2.1 深度模式，使用何种深度函数
folder.add(plane.material, 'depthFunc', {
  NeverDepth: THREE.NeverDepth,
  AlwaysDepth: THREE.AlwaysDepth,
  LessDepth: THREE.LessDepth,
  LessEqualDepth: THREE.LessEqualDepth,
  GreaterEqualDepth: THREE.GreaterEqualDepth,
  GreaterDepth: THREE.GreaterDepth,
  NotEqualDepth: THREE.NotEqualDepth,
}).name('深度模式');
//  48.2.2 深度写入，是否对深度缓冲区
folder.add(plane.material, 'depthWrite').name('深度写入');
//  48.2.3 深度测试，是否开启深度测试
folder.add(plane.material, 'depthTest').name('深度测试');
//  48.2.4 渲染顺序，默认：0，越小越先渲染
folder.add(plane, 'renderOrder', 0, 5).name('深度测试');


const folder1 = gui.addFolder('plane光');
// 48.2.5 深度模式，使用何种深度函数
folder1.add(plane1.material, 'depthFunc', {
  NeverDepth: THREE.NeverDepth,
  AlwaysDepth: THREE.AlwaysDepth,
  LessDepth: THREE.LessDepth,
  LessEqualDepth: THREE.LessEqualDepth,
  GreaterEqualDepth: THREE.GreaterEqualDepth,
  GreaterDepth: THREE.GreaterDepth,
  NotEqualDepth: THREE.NotEqualDepth,
}).name('深度模式');
//  48.2.6 深度写入，是否对深度缓冲区
folder1.add(plane1.material, 'depthWrite').name('深度写入');
//  48.2.7 深度测试，是否开启深度测试
folder1.add(plane1.material, 'depthTest').name('深度测试');
//  48.2.8 渲染顺序，默认：0，越小越先渲染
folder1.add(plane1, 'renderOrder', 0, 5).name('深度测试');

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