<!-- 134.打造元宇宙 -->
<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import gsap from 'gsap';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

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

import { Capsule } from 'three/examples/jsm/math/Capsule.js';
import { Octree } from 'three/examples/jsm/math/Octree.js';

innerWidth = window.innerWidth;
innerHeight = window.innerHeight;
const container = ref(null);

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let scene, camera, renderer, controls;

let stats, capsule, plane, group, worldOctree;

// 设置重力
const gravity = -9.8;
// 玩家速度
const playerVelocity = new THREE.Vector3(0, 0, 0);
// 玩家方向
const playerDirection = new THREE.Vector3(0, 0, 0);
// 玩家是否在地面上
let playerOnFloor = false;
// 创建一个人的碰撞体（胶囊形）
const playerCollider = new Capsule(
  new THREE.Vector3(0, 0.35, 0),
  new THREE.Vector3(0, 1.35, 0),
  0.35
);
// 按键状态
const keyStates = {
  'w': false,
  'a': false,
  's': false,
  'd': false,
  ' ': false,
  'isDown': false,
};

init();

// 初始化
function init() {
  createScene();
  createCamera(0, 5, 10);
  createRenderer();
  createStats();
  createAxes();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  createPlane();
  createCapsule();
  cerateOctree();
  initKeyEvent();
}

// 创建平面
function createPlane() {
  const geometry = new THREE.PlaneGeometry(20, 20, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0xfffffff,
    side: THREE.DoubleSide,
  });
  plane = new THREE.Mesh(geometry, material);
  plane.receiveShadow = true;
  plane.rotation.x = -Math.PI / 2;
}

// 创建一个胶囊物体
function createCapsule() {
  const geometry = new THREE.CapsuleGeometry(0.35, 1, 4, 8);
  const material = new THREE.MeshBasicMaterial({
    color: 0x0000ff,
    side: THREE.DoubleSide,
  });
  capsule = new THREE.Mesh(geometry, material);
  capsule.position.set(0, (0.35 + 1 + 0.35) / 2, 0);
  // 实现相机跟随胶囊移动
  // 将相机作为胶囊的子元素
  camera.position.set(0, 2, -5);
  camera.lookAt(capsule.position);
  capsule.add(camera);
  // 控制器设置中心为胶囊位置
  controls.target = capsule.position;

  scene.add(capsule);
}

// 更新玩家数据
function updatePlayer(deltaTime) {
  // 阻尼，可以理解为胶囊与地面的摩擦系数
  let damping = -0.08;
  if (playerOnFloor) {
    // 如果玩家已经在地面上，让下降速度重置为0
    playerVelocity.y = 0;
    // 停止键按的时，设置摩擦力，让胶囊自己停下来
    // addScaledVector将所传入的向量v与标量s相乘，所得的乘积和这个向量相加
    keyStates.isDown || playerVelocity.addScaledVector(playerVelocity, damping);
  } else {
    // 否则，下降速度随时间推移，不断增大
    playerVelocity.y += gravity * deltaTime;
  }
  // 计算玩家移动的距离
  const playerMoveDistance = playerVelocity.clone().multiplyScalar(deltaTime);
  playerCollider.translate(playerMoveDistance);
  // 设置胶囊位置 
  playerCollider.getCenter(capsule.position);

  playerCollisions();
}

// 碰撞检测组
function cerateOctree() {
  group = new THREE.Group();
  group.add(plane);
  scene.add(group);

  worldOctree = new Octree();
  worldOctree.fromGraphNode(group);
}

// 玩家碰撞检测
function playerCollisions() {
  const result = worldOctree.capsuleIntersect(playerCollider);
  // 默认不在地面上
  playerOnFloor = false;
  if (result) {
    playerOnFloor = result.normal.y > 0;
    // playerCollider，延法向方移动陷入深度(回到碰撞表面)
    playerCollider.translate(result.normal.multiplyScalar(result.depth));
  }
}

// 重置玩家信息
function resetPlayer() {
  if (capsule.position.y < -20) {
    playerCollider.start.set(0, 2 + 0.35, 0);
    playerCollider.end.set(0, 2 + 1.35, 0);
    playerCollider.radius = 0.35;
    playerVelocity.set(0, 0, 0);
    playerDirection.set(0, 0, 0);
  }
}

// 监听键盘按下事件
function initKeyEvent() {
  const isDown = true;
  document.addEventListener('keydown', event => updateKeyState(event, isDown), false);
  document.addEventListener('keyup', event => updateKeyState(event, !isDown), false);
}

// 跟据键盘事件更新按键状态
function updateKeyState(event, isDown) {
  const { key } = event;
  if (!(key in keyStates)) {
    return;
  }
  keyStates[event.key] = isDown;
  keyStates.isDown = isDown;
}

// 根据键盘状态更新玩家速度
function controlPlayer(time) {
  if (keyStates.w) {
    playerDirection.z = 1;
    const capsuleFront = new THREE.Vector3(0, 0, 0);
    // 获取胶囊正前面的方向
    // getWorldDirection是将表示该物体在世界空间中Z轴正方向的矢量，保存到capsuleFront
    capsule.getWorldDirection(capsuleFront);
    // 计算玩家速度
    // multiplyScalar将该向量与所传入的标量进行相乘
    // add将传入的向量和这个向量相加
    playerVelocity.add(capsuleFront.multiplyScalar(time));
  }
  if (keyStates.s) {
    playerDirection.z = 1;
    const capsuleFront = new THREE.Vector3(0, 0, 0);
    capsule.getWorldDirection(capsuleFront);
    playerVelocity.add(capsuleFront.multiplyScalar(-time));
  }
  if (keyStates.a) {
    playerDirection.z = 1;
    const capsuleFront = new THREE.Vector3(0, 0, 0);
    capsule.getWorldDirection(capsuleFront);
    // 计算侧方向
    // 正前方向和正上方向可以确定一个面，求叉积，得到侧方向
    // capsuleFront正前方向
    // capsule.up正上方向
    // cross将该向量设置为它本身与传入的向量v的叉积
    capsuleFront.cross(capsule.up);
    playerVelocity.add(capsuleFront.multiplyScalar(-time));
  }
  if (keyStates.d) {
    playerDirection.z = 1;
    const capsuleFront = new THREE.Vector3(0, 0, 0);
    capsule.getWorldDirection(capsuleFront);
    capsuleFront.cross(capsule.up);
    playerVelocity.add(capsuleFront.multiplyScalar(time));
  }
}

// 创建场景
function createScene() {
  scene = new THREE.Scene();
  // 新增
  scene.background = new THREE.Color(0x88ccee);
  scene.fog = new THREE.Fog(0x88ccee, 0, 50);
}

// 创建相机
function createCamera(x = 0, y = 0, z = 10) {
  camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.001, 1000);
  camera.position.set(x, y, z);
  scene.add(camera);
}


// 创建渲染器
function createRenderer() {
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(innerWidth, innerHeight);
  // 新增
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
}

// 创建渲染函数
function render() {
  const time = clock.getDelta();

  controlPlayer(time);
  updatePlayer(time);
  resetPlayer();

  controls && controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

// 创建性能监控
function createStats() {
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0';
}

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

// 添加stats进DOM
function appendStats() {
  container.value.appendChild(stats.domElement);
}

onMounted(() => {
  appendCanvas();
  appendStats();
  createControls();
  createCode();
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