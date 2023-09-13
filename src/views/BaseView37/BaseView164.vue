<!-- 164.流体模拟 -->
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
  createCamera(0, 20, 80);
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

  const planeShape = new CANNON.Plane();
  const comonMaterial = new CANNON.Material('comonMaterial');
  const planeGeometry = new THREE.PlaneGeometry(5, 5);
  const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x666666, wireframe: true });

  // 地面body
  const floorBody = new CANNON.Body({
    mass: 0,
    shape: planeShape,
    material: comonMaterial,
    position: new CANNON.Vec3(0, 0, 0)
  });
  floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  world.addBody(floorBody);
  phyMeshes.push(floorBody);
  // 地面
  const floor = new THREE.Mesh(planeGeometry, new THREE.MeshBasicMaterial({ color: 0x666666 }));
  scene.add(floor);
  meshes.push(floor);

  // 前面body
  const fBody = new CANNON.Body({
    mass: 0,
    shape: planeShape,
    material: comonMaterial,
    position: new CANNON.Vec3(0, 2.5, 2.5)
  });
  fBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI);
  world.addBody(fBody);
  phyMeshes.push(fBody);
  // 前面
  const f = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(f);
  meshes.push(f);

  // 后面body
  const bBody = new CANNON.Body({
    mass: 0,
    shape: planeShape,
    material: comonMaterial,
    position: new CANNON.Vec3(0, 2.5, -2.5)
  });
  world.addBody(bBody);
  phyMeshes.push(bBody);
  // 后面
  const b = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(b);
  meshes.push(b);

  // 左面body
  const lBody = new CANNON.Body({
    mass: 0,
    shape: planeShape,
    material: comonMaterial,
    position: new CANNON.Vec3(2.5, 2.5, 0)
  });
  lBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
  world.addBody(lBody);
  phyMeshes.push(lBody);
  // 左面
  const l = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(l);
  meshes.push(l);

  // 右面body
  const rBody = new CANNON.Body({
    mass: 0,
    shape: planeShape,
    material: comonMaterial,
    position: new CANNON.Vec3(-2.5, 2.5, 0)
  });
  rBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
  world.addBody(rBody);
  phyMeshes.push(rBody);
  // 右面
  const r = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(r);
  meshes.push(r);

  // 创建SPH流体系统
  const sphSystem = new CANNON.SPHSystem({
    // 流体密度
    density: 1,
    // 流体粘度
    viscosity: 0.01,
    // 流体交互距离
    smoothingRadius: 1,
  });
  // 将流体系统添加到世界中
  world.subsystems.push(sphSystem);

  // 创建流体粒子
  const particleShape = new CANNON.Particle();
  const sphereGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  for (let i = 0; i < 200; i++) {
    // 刚体
    const particleBody = new CANNON.Body({
      mass: 0.1,
      shape: particleShape,
      material: comonMaterial,
      position: new CANNON.Vec3(
        Math.random() - 0.5,
        15 + i,
        Math.random() - 0.5
      )
    });
    world.addBody(particleBody);
    phyMeshes.push(particleBody);
    // 将粒子添加到流体系统中
    sphSystem.add(particleBody);
    // 粒子
    const particle = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(particle);
    meshes.push(particle);
  }
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