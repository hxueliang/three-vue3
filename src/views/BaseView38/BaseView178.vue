<!-- 178.候鸟集群聚散效果 -->
<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import gsap from 'gsap';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as YUKA from 'yuka';
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

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
const container = ref(null);

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let scene, camera, renderer, controls;

let entityManager;

init();

// 初始化
function init() {
  createScene();
  createCamera(0, 80, 80);
  createRenderer();
  createSpotLight(10, 70, 10, 12000, 0xffffff, 100, Math.PI / 8, 0.5, true);
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  // 创建实体管理对象
  entityManager = new YUKA.EntityManager();

  // 创建平面
  const planeGeometry = new THREE.PlaneGeometry(80, 80);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -1;
  scene.add(plane);

  // 加载汽车模型
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./draco/');
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load('./model/yuka/car.gltf', gltf => {
    // 创建随机行走行为
    const wanderBehavior = new YUKA.WanderBehavior(3);

    for (let i = 0; i < 40; i++) {
      const car = gltf.scene.clone();
      car.children[0].rotation.y = Math.PI / 2;
      car.children[0].scale.set(0.5, 0.5, 0.5);
      scene.add(car);

      const vehicle = new YUKA.Vehicle();
      vehicle.maxSpeed = 3;
      setPosition(vehicle, 40);
      vehicle.rotation.fromEuler(0, Math.random() * Math.PI / 6, 0);
      vehicle.setRenderComponent(car, callback);
      entityManager.add(vehicle);

      vehicle.steering.add(wanderBehavior);
    }
  });

  // 设置随机位置
  function setPosition(obj, scale = 20) {
    const x = Math.random() * scale - scale / 2;
    const z = Math.random() * scale - scale / 2;
    obj.position.set(x, 0, z);
  }

  // 设置车辆的渲染对象
  function callback(entity, renderComponent) {
    renderComponent.position.copy(entity.position);
    renderComponent.quaternion.copy(entity.rotation);
    // renderComponent.matrix.copy(entity.worldMatrix);
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
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setSize(innerWidth, innerHeight);
}
const time = new YUKA.Time();
// 创建渲染函数
function render() {
  const delta = time.update().getDelta();
  entityManager && entityManager.update(delta);

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

// 添加聚光灯
function createSpotLight(
  x = 0, y = 0, z = 10,
  strength = 1, color = '#ffffff', distance = 0, angle = Math.PI / 3, penumbra = 0,
  castShadow = false
) {
  const light = new THREE.SpotLight(color, strength, distance, angle, penumbra);
  light.position.set(x, y, z);
  light.castShadow = castShadow;
  scene.add(light);
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