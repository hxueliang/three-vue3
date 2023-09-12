<!-- 156.施加力的方式 -->
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

  // 创建刚体(球)
  const sphereBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Sphere(0.5),
    material: comonMaterial,
    position: new CANNON.Vec3(0, 5, 0),
  });
  // 2.1，4.1 让球旋转180度
  // sphereBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), Math.PI);
  world.addBody(sphereBody);
  phyMeshes.push(sphereBody);

  // threejs渲染
  // 创建平面
  const plane = new THREE.Mesh(
    new THREE.BoxGeometry(10, 0.2, 10),
    new THREE.MeshBasicMaterial({ color: 0xffff00 })
  );
  plane.position.copy(planeBody.position);
  plane.quaternion.copy(planeBody.quaternion);
  scene.add(plane);

  // 创建球
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true })
  );
  scene.add(sphere);
  meshes.push(sphere);

  window.addEventListener('click', () => {
    /**
     * 给刚体施加力
     * @param {Vec3} force - 力
     * @param {Vec3} position - 作用位置
     */
    console.log(sphereBody.position);
    // 1.1 世界坐标
    // sphereBody.applyForce(new CANNON.Vec3(10, 0, 0), new CANNON.Vec3(0, 0, 0)); // 平滑
    // sphereBody.applyForce(new CANNON.Vec3(10, 0, 0), new CANNON.Vec3(0, 0.5, 0)); // a效果：向右顺时针翻滚
    // sphereBody.applyForce(new CANNON.Vec3(10, 0, 0), new CANNON.Vec3(0, -0.5, 0)); // b效果：向右逆时针翻滚

    // 2.2 球自身物理变换后的坐标
    // sphereBody.applyLocalForce(new CANNON.Vec3(10, 0, 0), new CANNON.Vec3(0, 0.5, 0)); // c效果：向左顺时针翻滚
    // sphereBody.applyLocalForce(new CANNON.Vec3(10, 0, 0), new CANNON.Vec3(0, -0.5, 0)); // d效果：向左逆时针翻滚

    // 3.1 脉冲的方式，力乘上1/60秒
    // sphereBody.applyImpulse(new CANNON.Vec3(10 * (1 / 60), 0, 0), new CANNON.Vec3(0, 0.5, 0));// a效果：向右顺时针翻滚
    // sphereBody.applyImpulse(new CANNON.Vec3(10 * (1 / 60), 0, 0), new CANNON.Vec3(0, -0.5, 0));// b效果：向右逆时针翻滚

    // 4.2 脉冲的方式，力乘上1/60秒
    // sphereBody.applyLocalImpulse(new CANNON.Vec3(10 * (1 / 60), 0, 0), new CANNON.Vec3(0, 0.5, 0));// c效果：向左顺时针翻滚
    // sphereBody.applyLocalImpulse(new CANNON.Vec3(10 * (1 / 60), 0, 0), new CANNON.Vec3(0, -0.5, 0));// d效果：向左逆时针翻滚


    // 5.1 扭距方式
    // sphereBody.applyTorque(new CANNON.Vec3(0, 0, 10)); // e效果：z轴逆时针旋转
    sphereBody.applyTorque(new CANNON.Vec3(0, 0, -10)); // f效果：z轴顺时针旋转
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