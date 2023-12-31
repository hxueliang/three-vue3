<!-- 163.铰链约束 -->
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
import { GLSL1 } from 'three';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
const container = ref(null);

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let scene, camera, renderer, controls;

let world;

const phyMeshes = [], meshes = [];

init();

// 初始化
function init() {
  createScene();
  createCamera(0, 20, 40);
  createRenderer();
  createAxes();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  // 物理世界
  // 初始化物理世界
  world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });
  // 物理世界允许休眠
  world.allowSleep = true;

  const comonMaterial = new CANNON.Material('comonMaterial');
  const boxShape = new CANNON.Box(new CANNON.Vec3(2.5, 2.5, 0.25));
  const boxGeometry = new THREE.BoxGeometry(5, 5, 0.5);
  const boxMaterial = new THREE.MeshBasicMaterial({ color: 0xff6666 });

  // 创建刚体(立方体)
  const fixedBody = new CANNON.Body({
    mass: 0,
    shape: boxShape,
    material: comonMaterial,
    position: new CANNON.Vec3(0, 10, 0),
  });
  world.addBody(fixedBody);
  phyMeshes.push(fixedBody);
  // 创建立方体
  const box1 = new THREE.Mesh(boxGeometry, boxMaterial);
  scene.add(box1);
  meshes.push(box1);

  // 创建刚体(立方体)
  const moveBody = new CANNON.Body({
    mass: 1,
    shape: boxShape,
    material: comonMaterial,
    position: new CANNON.Vec3(0, 4, 0),
  });
  world.addBody(moveBody);
  phyMeshes.push(moveBody);
  // 创建立方体
  const box2 = new THREE.Mesh(boxGeometry, boxMaterial);
  scene.add(box2);
  meshes.push(box2);

  const constraint = new CANNON.HingeConstraint(fixedBody, moveBody, {
    // bodyA可以旋转的轴，定义在bodyA的局部。
    axisA: new CANNON.Vec3(1, 0, 0),
    // bodyB可以旋转的轴，在bodyB中局部定义。
    axisB: new CANNON.Vec3(1, 0, 0),
    // bodyA力的作用点
    pivotA: new CANNON.Vec3(0, -3, 0),
    // bodyB力的作用点
    pivotB: new CANNON.Vec3(0, 3, 0),
    // 是否碰撞连接的物体
    // collideConnected: true,
    // 约束物体所应施加的最大力
    // maxForce: 10,
  });
  world.addConstraint(constraint);

  window.addEventListener('click', () => {
    // 添加力
    // moveBody.applyForce(new CANNON.Vec3(0, 0, -1000), box2.position);

    // 启用马达
    constraint.enableMotor();
    constraint.setMotorSpeed(10);
  });
}

// 创建场景
function createScene() {
  scene = new THREE.Scene();
}

// 创建相机
function createCamera(x = 0, y = 0, z = 10) {
  camera = new THREE.PerspectiveCamera(25, innerWidth / innerHeight, 0.1, 3000);
  camera.position.set(x, y, z);
  scene.add(camera);
}

// 创建渲染器
function createRenderer() {
  renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(innerWidth, innerHeight);
}

// 创建渲染函数
function render() {
  const delta = clock.getDelta();

  world.step(1 / 60, delta);
  for (let i = 0; i < phyMeshes.length; i++) {
    meshes[i].position.copy(phyMeshes[i].position);
    meshes[i].quaternion.copy(phyMeshes[i].quaternion);
  }

  controls && controls.update();
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