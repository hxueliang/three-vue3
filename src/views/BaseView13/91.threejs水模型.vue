<!-- 91.threejs水模型 -->
<!-- 91.1.2 -->
<!-- 在官网项目中，把目录examples/textures/water -->
<!-- cv到自己项目，public/textures/water -->
<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import gsap from 'gsap';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';

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
import { Water } from 'three/examples/jsm/objects/Water2';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 300);
camera.position.set(1, 2, 5);
scene.add(camera);

const gui = new GUI();


// 91.1.1 创建水材质平面
// const waterGeometry = new THREE.PlaneGeometry(10, 10, 1024, 1024);
const waterMaterial = {
  color: '#ffffff',
  scale: 1,
  flowDirection: new THREE.Vector2(1, 1), // 水纹方向
  textureWidth: 1024,
  textureHeight: 1024
};
// const water = new Water(waterGeometry, waterMaterial);
// water.rotation.x = -Math.PI / 2;
// scene.add(water);

// 91.2.1 加载环境贴图
const rgbeLoader = new RGBELoader();
rgbeLoader.loadAsync('./hdr/island.hdr').then(envMap => {
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = envMap;
  scene.environment = envMap;
});
// 91.2.2 加载浴缸模型
const gltfLoader = new GLTFLoader();
gltfLoader.load('./model/yugang.glb', gltf => {
  const yugang = gltf.scene.children[0];
  yugang.material.side = THREE.DoubleSide;

  console.log(yugang);

  const yugangWater = gltf.scene.children[1];
  const water = new Water(yugangWater.geometry, waterMaterial);

  scene.add(yugang);
  scene.add(water);
});
// 91.2.3 加载鸭子模型
let duck = null;
gltfLoader.load('./model/Duck.glb', gltf => {
  gltf.scene.position.y = -0.55;
  duck = gltf.scene;
  scene.add(gltf.scene);
});

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setSize(innerWidth, innerHeight);

// 1.6 创建控制器
let cantrols = null;
function createControls() {
  cantrols = new OrbitControls(camera, container.value);
  cantrols.enableDamping = true;
  cantrols.dampingFactor = 0.05; // 阻尼：值越大惯性越小，0不能动
}

// 1.7 添加坐标轴辅助器
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// 设置时钟
const clock = new THREE.Clock();

// 91.3.2 控制方向
let direction = 1;

// 91.3.1 反复游泳
function swim(duck, time) {
  if (!duck) { return; }

  // 鸭子移动
  duck.position.x += direction * time;

  // 鸭子调头
  if (duck.position.x > 1.8 || duck.position.x < 0) {
    direction *= -1;
    duck.rotation.y += Math.PI;
  }
}

// 1.5 创建渲染函数
function render() {
  const elapsedTime = clock.getDelta();
  swim(duck, elapsedTime);

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
  container.value.appendChild(renderer.domElement);
  createControls();
  render();
});
</script>

<style lang="less" scope>
.container {
  width: 100vw;
  height: 100vh;
}
</style>
<style>
body {
  background-color: #1e1a20;
}
</style>