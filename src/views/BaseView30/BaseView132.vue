<!-- 114.使用css2d渲染器 -->
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

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

innerWidth = window.innerWidth;
innerHeight = window.innerHeight;
const container = ref(null);

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let scene, camera, renderer, controls;

let sphere, torusKnot, cube;

let composer;

init();

// 初始化
function init() {
  createScene();
  createCamera();
  createRenderer();
  createAxes();
  // createAmbientLight();
  // createDirLight();
  // createPointLight();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  createSphere();
  createTorusKnot();
  createBox();

  createEffect();
  initEvent();
}

// 初始化点击事件
function initEvent() {
  window.addEventListener('click', () => {
    if (sphere.layers.mask === 1) {
      sphere.layers.set(1);
    } else {
      sphere.layers.set(0);
    }
  });

  /*
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const meshArr = [sphere, torusKnot, cube];
  window.addEventListener('click', event => {
    mouse.x = event.clientX / window.innerWidth * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight * 2 - 1);
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(meshArr, false);
    // Todo: raycaster无法检测不同层的物体
    if (!intersects[0]) {
      return;
    }
    const mesh = intersects[0].object;
    if (mesh.layers.mask === 1) {
      mesh.layers.set(1);
    } else {
      mesh.layers.set(0);
    }
  });
  */
}

// 添加后期处理
function createEffect() {
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const unrealBloomPass = new UnrealBloomPass(
    // 要影响泛光的画布大小
    new THREE.Vector2(innerWidth, innerHeight),
    // 泛光的强度
    1.5,
    // 泛光的半径
    0.4,
    // 泛光的阈值
    0.2
  );
  composer.addPass(unrealBloomPass);
}

// 创建球
function createSphere() {
  const geometry = new THREE.SphereGeometry(1, 32, 16);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(-5, 0, 0);
  scene.add(sphere);
}

// 创建扭结
function createTorusKnot() {
  const geometry = new THREE.TorusKnotGeometry(1, 0.2, 64, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  torusKnot = new THREE.Mesh(geometry, material);
  scene.add(torusKnot);
}

// 创建立方体
function createBox() {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(5, 0, 0);
  // 物体的层级关系。 物体只有和一个正在使用的Camera至少在同一个层时才可见。
  // 当使用Raycaster进行射线检测的时候此项属性可以用于过滤不参与检测的物体.
  // 默认值为0
  cube.layers.set(1); // 相机默认也是0层，所以物体不可见
  scene.add(cube);
}

// 创建场景
function createScene() {
  scene = new THREE.Scene();
}

// 创建相机
function createCamera(x = 0, y = 0, z = 10) {
  camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 300);
  camera.position.set(x, y, z);
  scene.add(camera);
}


// 创建渲染器
function createRenderer() {
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(innerWidth, innerHeight);
  // 设置每次渲染不自动清除
  renderer.autoClear = false;
}

// 创建渲染函数
function render() {
  const elapsed = clock.getElapsedTime();

  controls && controls.update();

  // 手动清除
  renderer.clear();

  camera.layers.set(0);
  composer.render();

  // 清除深度缓冲区片元深度数据
  renderer.clearDepth();
  camera.layers.set(1);
  renderer.render(scene, camera);

  requestAnimationFrame(render);
};

// 创建控制器
function createControls() {
  controls = new OrbitControls(camera, container.value);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
}

// 添加坐标轴辅助器
function createAxes(show = true) {
  if (!show) { return; }
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);
}

// 添加环境光
function createAmbientLight(strength = 1, color = '#ffffff') {
  const ambientLight = new THREE.AmbientLight(color, strength);
  scene.add(ambientLight);
}

// 添加点光源
function createPointLight(x = 0, y = 0, z = 10, strength = 1, color = '#ffffff') {
  const pointLight = new THREE.PointLight(color, strength);
  pointLight.position.set(x, y, z);
  scene.add(pointLight);
}

// 添加平行光
function createDirLight(x = 0, y = 0, z = 10, strength = 1, color = '#ffffff', castShadow = false) {
  const dirLight = new THREE.DirectionalLight(color, strength);
  dirLight.castShadow = castShadow;
  dirLight.position.set(x, y, z);
  scene.add(dirLight);
}

// 监听视口变化
function onWindowResize() {
  innerWidth = window.innerWidth;
  innerHeight = window.innerHeight;
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}

// 添加画布进DOM
function appendCanvas() {
  container.value.appendChild(renderer.domElement);
}

onMounted(() => {
  createCode();
  appendCanvas();
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