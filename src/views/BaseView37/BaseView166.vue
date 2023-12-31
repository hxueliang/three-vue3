<!-- 166.模拟有悬架的车辆 -->
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

  // 创建地面
  const groundPhyMaterial = new CANNON.Material('comonMaterial');
  const groundShape = new CANNON.Box(new CANNON.Vec3(50, 0.2, 50));
  const groundBody = new CANNON.Body({
    mass: 0,
    shape: groundShape,
    material: groundPhyMaterial,
  });
  world.addBody(groundBody);
  phyMeshes.push(groundBody);

  const groundMesh = new THREE.Mesh(
    new THREE.BoxGeometry(100, 0.4, 100),
    new THREE.MeshBasicMaterial({
      color: 0x666666,
    })
  );
  scene.add(groundMesh);
  meshes.push(groundMesh);

  // 创建刚体(车身)
  let chassisShape = new CANNON.Box(new CANNON.Vec3(2, 0.5, 1));
  let chassisBody = new CANNON.Body({
    mass: 150,
    shape: chassisShape,
  });
  chassisBody.position.set(0, 5, 0);
  world.addBody(chassisBody);
  phyMeshes.push(chassisBody);
  // 创建车身
  let chassisMesh = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1, 2),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );
  scene.add(chassisMesh);
  meshes.push(chassisMesh);

  // 创建拥有悬架的车辆
  const vehicle = new CANNON.RaycastVehicle({
    chassisBody: chassisBody,
  });

  const wheelOptions = {
    // 车轮半径
    radius: 0.5,
    directionLocal: new CANNON.Vec3(0, -1, 0),
    // 设置悬架的刚度
    suspensionStiffness: 30,
    // 设置悬架的休息长度
    suspensionRestLength: 0.3,
    // 设置车轮的滑动摩擦力
    frictionSlip: 1.4,
    // 设置拉伸的阻尼
    dampingRelaxation: 2.3,
    // 设置压缩的阻尼
    dampingCompression: 4.4,
    // 最大的悬架力
    maxSuspensionForce: 100000,
    // 设置最大的悬架行程
    maxSuspensionTravel: 0.2,
    // 车轮的转向轴
    axleLocal: new CANNON.Vec3(0, 0, 1),
  };

  // 轮子位置
  const wheelArray = [
    { position: new CANNON.Vec3(-1, 0, 1) },
    { position: new CANNON.Vec3(-1, 0, -1) },
    { position: new CANNON.Vec3(1, 0, 1) },
    { position: new CANNON.Vec3(1, 0, -1) },
  ];
  // 创建4个轮子
  wheelArray.forEach(wheel => {
    vehicle.addWheel({
      ...wheelOptions,
      chassisConnectionPointLocal: wheel.position,
    });
  });

  vehicle.addToWorld(world);

  const wheelBodies = [];

  // 车轮形状
  const wheelShape = new CANNON.Cylinder(0.5, 0.5, 0.2, 20);
  const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 20);
  const wheelMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true,
  });

  for (let i = 0; i < vehicle.wheelInfos.length; i++) {
    const wheel = vehicle.wheelInfos[i];
    const cylinderBody = new CANNON.Body({
      mass: 0,
      shape: wheelShape,
    });
    cylinderBody.addShape(wheelShape);
    // world.addBody(cylinderBody);
    phyMeshes.push(cylinderBody);
    wheelBodies.push(cylinderBody);

    const cylinderMesh = new THREE.Mesh(wheelGeometry, wheelMaterial);
    cylinderMesh.rotation.x = -Math.PI / 2;
    const wheelObj = new THREE.Object3D();
    wheelObj.add(cylinderMesh);
    scene.add(wheelObj);
    meshes.push(wheelObj);
  }

  world.addEventListener("postStep", () => {
    for (let i = 0; i < vehicle.wheelInfos.length; i++) {
      vehicle.updateWheelTransform(i);
      const t = vehicle.wheelInfos[i].worldTransform;
      const wheelBody = wheelBodies[i];
      wheelBody.position.copy(t.position);
      wheelBody.quaternion.copy(t.quaternion);
    }
  });


  // 控制车子
  window.addEventListener("keydown", (event) => {
    console.log(event.key);
    if (event.key === "w") {
      // setWheelForce(力，轮子编号)
      vehicle.applyEngineForce(1000, 0);
      vehicle.applyEngineForce(1000, 1);
      // vehicle.applyEngineForce(10000, 2);
      // vehicle.applyEngineForce(10000, 3);
    }
    if (event.key === "s") {
      vehicle.applyEngineForce(-1000, 0);
      vehicle.applyEngineForce(-1000, 1);
    }
    if (event.key == "a") {
      vehicle.setSteeringValue(Math.PI / 4, 2);
      vehicle.setSteeringValue(Math.PI / 4, 3);
    }
    if (event.key == "d") {
      vehicle.setSteeringValue(-Math.PI / 4, 2);
      vehicle.setSteeringValue(-Math.PI / 4, 3);
    }
  });
  window.addEventListener("keyup", (event) => {
    if (event.key === "w") {
      vehicle.applyEngineForce(0, 0);
      vehicle.applyEngineForce(0, 1);
    }
    if (event.key === "s") {
      vehicle.applyEngineForce(0, 0);
      vehicle.applyEngineForce(0, 1);
    }
    if (event.key == "a") {
      vehicle.setSteeringValue(0, 2);
      vehicle.setSteeringValue(0, 3);
    }
    if (event.key == "d") {
      vehicle.setSteeringValue(0, 2);
      vehicle.setSteeringValue(0, 3);
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