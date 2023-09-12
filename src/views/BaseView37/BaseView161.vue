<!-- 161.弹簧约束 -->
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

  // 创建材质
  const comonMaterial = new CANNON.Material('comonMaterial');
  comonMaterial.friction = 0;
  comonMaterial.restitution = 0.3;

  // 创建刚体(平面)
  const planeBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Box(new CANNON.Vec3(5, 0.1, 5)),
    position: new CANNON.Vec3(0, -0.1, 0),
    material: comonMaterial,
  });
  world.addBody(planeBody);
  // 创建平面
  const plane = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.2, 10),
    new THREE.MeshBasicMaterial({ color: 0x6666aa })
  );
  plane.position.copy(planeBody.position);
  plane.quaternion.copy(planeBody.quaternion);
  scene.add(plane);

  // 创建刚体(球)
  const sphereBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Sphere(0.2),
    position: new CANNON.Vec3(0, 8, 0),
    material: comonMaterial,
  });;
  world.addBody(sphereBody);
  phyMeshes.push(sphereBody);
  // 创建球
  const shpere = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0x006600 })
  );
  scene.add(shpere);
  meshes.push(shpere);

  // 创建刚体(立方体)
  const boxBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)),
    material: comonMaterial,
    position: new CANNON.Vec3(0, 5, 0),
  });
  world.addBody(boxBody);
  phyMeshes.push(boxBody);
  // 创建立方体
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshBasicMaterial({ color: 0xff6666 })
  );
  scene.add(box);
  meshes.push(box);

  // 连接两个物体的弹簧
  const spring = new CANNON.Spring(sphereBody, boxBody, {
    // 弹簧没受力时的长度
    restLength: 3,
    // 弹簧的刚度
    stiffness: 50,
    // 阻尼
    damping: 1,
    // 作用锚点
    localAnchorA: new CANNON.Vec3(0, 0, 0),
    localAnchorB: new CANNON.Vec3(-0.5, 0.5, 0.5)
  });
  // 计算每一步后的力
  world.addEventListener('postStep', (event) => { // preStep
    spring.applyForce();
  });

  // 创建子弹射击
  const bulletShape = new CANNON.Sphere(0.5);
  const position = new CANNON.Vec3(0, 5, 3);
  const shpereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const shpereMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
  window.addEventListener('click', () => {
    const shpereBody = new CANNON.Body({
      mass: 1,
      shape: bulletShape,
      position,
      material: comonMaterial,
    });
    shpereBody.velocity.set(0, 0, -10);
    world.addBody(shpereBody);
    phyMeshes.push(shpereBody);

    const shpere = new THREE.Mesh(shpereGeometry, shpereMaterial);
    scene.add(shpere);
    meshes.push(shpere);
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