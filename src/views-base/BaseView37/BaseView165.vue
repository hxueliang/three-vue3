<!-- 165.模拟车辆行驶 -->
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
  createCamera(0, 50, 130);
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
    shape: new CANNON.Plane(),
    position: new CANNON.Vec3(0, 0, 0),
    material: comonMaterial,
  });
  planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  world.addBody(planeBody);
  // 创建平面
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshBasicMaterial({ color: 0x666666 })
  );
  plane.position.copy(planeBody.position);
  plane.quaternion.copy(planeBody.quaternion);
  scene.add(plane);

  // 创建刚体(车身)
  const chassisBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Box(new CANNON.Vec3(4, 0.5, 2)),
    position: new CANNON.Vec3(0, 5, 0)
  });
  // world.addBody(chassisBody);
  phyMeshes.push(chassisBody);
  // 创建车身
  const chassisMesh = new THREE.Mesh(
    new THREE.BoxGeometry(8, 1, 4),
    new THREE.MeshBasicMaterial({ color: 0x996633 })
  );
  scene.add(chassisMesh);
  meshes.push(chassisMesh);

  // 创建刚性车身
  const vehicle = new CANNON.RigidVehicle({
    chassisBody
  });

  // 轮子共同属性
  const wheelShape = new CANNON.Sphere(1.5);
  const wheelGeometry = new THREE.SphereGeometry(1.5, 8, 8);
  const wheelMaterial = new THREE.MeshBasicMaterial({
    color: 0x999999,
    wireframe: true,
  });
  // 轮子位置
  const wheelArray = [
    { position: new CANNON.Vec3(-3, -0.2, 3.5) },
    { position: new CANNON.Vec3(3, -0.2, 3.5) },
    { position: new CANNON.Vec3(-3, -0.2, -3.5) },
    { position: new CANNON.Vec3(3, -0.2, -3.5) },
  ];
  // 创建4个轮子
  wheelArray.forEach(wheel => {
    // 创建刚体(轮子1)
    const wheelBody1 = new CANNON.Body({ mass: 1, shape: wheelShape });
    // world.addBody(wheelBody1);
    phyMeshes.push(wheelBody1);
    // 创建轮子1
    const wheelMesh1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
    scene.add(wheelMesh1);
    meshes.push(wheelMesh1);
    // 添加轮子1
    vehicle.addWheel({
      body: wheelBody1,
      // 轮子位置
      position: wheel.position,
      // 旋转轴
      axis: new CANNON.Vec3(0, 0, -1),
      // 转弯轴
      direction: new CANNON.Vec3(0, -1, 0),
    });
  });

  // 将车身添加到世界
  // 这句代码必须写在最后
  // 前面的1+4个body添加到世界的操作可以去掉了
  vehicle.addToWorld(world);

  // 控制车子
  controlVehicle(vehicle);
}

function controlVehicle(vehicle) {
  window.addEventListener('keydown', ({ key }) => {
    if (key === 'w') {
      vehicle.setWheelForce(-100, 0); // 第一个轮子
      vehicle.setWheelForce(-100, 2); // 第三个轮子
    }
    if (key === 's') {
      vehicle.setWheelForce(100, 0); // 第一个轮子
      vehicle.setWheelForce(100, 2); // 第三个轮子
    }
    if (key === 'a') {
      vehicle.setSteeringValue(Math.PI / 4, 0); // 第一个轮子
      vehicle.setSteeringValue(Math.PI / 4, 2); // 第三个轮子
    }
    if (key === 'd') {
      vehicle.setSteeringValue(-Math.PI / 4, 0); // 第一个轮子
      vehicle.setSteeringValue(-Math.PI / 4, 2); // 第三个轮子
    }
  });
  window.addEventListener('keyup', ({ key }) => {
    if (key === 'w') {
      vehicle.setWheelForce(0, 0);
      vehicle.setWheelForce(0, 2);
    }
    if (key === 's') {
      vehicle.setWheelForce(0, 0);
      vehicle.setWheelForce(0, 2);
    }
    if (key === 'a') {
      vehicle.setSteeringValue(0, 0); // 第一个轮子
      vehicle.setSteeringValue(0, 2); // 第三个轮子
    }
    if (key === 'd') {
      vehicle.setSteeringValue(0, 0); // 第一个轮子
      vehicle.setSteeringValue(0, 2); // 第三个轮子
    }
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