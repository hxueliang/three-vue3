<!-- 154.多种形状组合物体 -->
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
  createCamera(5, 15, 30);
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

  // 创建材质
  const comonMaterial = new CANNON.Material('comonMaterial');
  comonMaterial.friction = 0.2;
  comonMaterial.restitution = 0.7;

  // 创建刚体(平面)
  const planeBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(5, 0.1, 5)),
    position: new CANNON.Vec3(0, -0.1, 0),
    material: comonMaterial,
  });
  world.addBody(planeBody);

  // 创建球形状
  const sphereShape1 = new CANNON.Sphere(0.5);
  const sphereShape2 = new CANNON.Sphere(0.5);
  // 创建圆柱休形状
  const cylinderShape = new CANNON.Cylinder(0.5, 0.5, 1, 32);

  // 创建刚体(形状后期添加)
  const capsuleBody = new CANNON.Body({
    mass: 1,
    material: comonMaterial,
    position: new CANNON.Vec3(0, 1, 0),
  });
  // 给刚体添加形状
  capsuleBody.addShape(sphereShape1, new CANNON.Vec3(0, 0.5, 0));
  capsuleBody.addShape(cylinderShape, new CANNON.Vec3(0, 0, 0));
  capsuleBody.addShape(sphereShape2, new CANNON.Vec3(0, -0.5, 0));
  // 添速度，测试效果
  capsuleBody.velocity.set(5, 0, 0);
  // 添加到物理世界
  world.addBody(capsuleBody);
  phyMeshes.push(capsuleBody);

  // threejs渲染
  // 创建材质
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

  // 创建平面
  const planeGeometry = new THREE.BoxGeometry(10, 0.2, 10);
  const mplaneMterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const plane = new THREE.Mesh(planeGeometry, mplaneMterial);
  plane.position.copy(planeBody.position);
  plane.quaternion.copy(planeBody.quaternion);
  scene.add(plane);

  // 创建圆柱体
  const cylinder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
    new THREE.MeshBasicMaterial({ color: 0x0000ff })
  );
  cylinder.position.copy(capsuleBody.position);
  cylinder.quaternion.copy(capsuleBody.quaternion);
  scene.add(cylinder);
  meshes.push(cylinder);

  // 创建球体
  const sphere1 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
  sphere1.position.set(0, 0.5, 0);
  cylinder.add(sphere1);
  const sphere2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material);
  sphere2.position.set(0, -0.5, 0);
  cylinder.add(sphere2);
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