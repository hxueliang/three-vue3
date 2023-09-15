<!-- 180.导航网格实现避障寻路 -->
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
  createCamera(10, 30, 100);
  createRenderer();
  createSpotLight(10, 70, 10, 12000, 0xffffff, 100, Math.PI / 8, 0.5, true);
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  // 加载地面模型
  let plane;
  gltfLoader.load('./model/yuka/modelMap.gltf', gltf => {
    plane = gltf.scene;
    plane.traverse(child => {
      if (child.isMesh) {
        child.receiveShadow = true;
        child.castShadow = true;
      }
    });
    scene.add(plane);
  });

  // 加载汽车模型
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./draco/');
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load('./model/yuka/car.gltf', gltf => {
    gltf.scene.children[0].rotation.y = Math.PI / 2;
    gltf.scene.children[0].scale.set(0.5, 0.5, 0.5);
    scene.add(gltf.scene);
    // 设置车辆的渲染对象
    vehicle.setRenderComponent(gltf.scene, callback);
  });

  // 创建yuka的车辆
  const vehicle = new YUKA.Vehicle();
  vehicle.maxSpeed = 5;
  // 设置车辆的渲染对象
  // vehicle.setRenderComponent(cone, callback);
  function callback(entity, renderComponent) {
    renderComponent.position.copy(entity.position);
    renderComponent.quaternion.copy(entity.rotation);
    // renderComponent.matrix.copy(entity.worldMatrix);
  }

  // 创建目标小球
  const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const sphereMaterail = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterail);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  scene.add(sphere);

  // 创建目标
  const target = new YUKA.GameEntity();
  target.setRenderComponent(sphere, callback);
  setPosition();

  // 设置随机位置
  function setPosition() {
    target.position.set(Math.random() * 20 - 10, 0, Math.random() * 20 - 10);
  }

  // 点击修改目标位置
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  window.addEventListener('pointerdown', event => {
    ndc.x = event.clientX / window.innerWidth * 2 - 1;
    ndc.y = -(event.clientY / window.innerHeight * 2 - 1);
    raycaster.setFromCamera(ndc, camera);
    let intersects = raycaster.intersectObject(plane);
    if (intersects.length === 0) { return; }
    const { point } = intersects[0];
    target.position.set(point.x, 0, point.z);
  });

  // 到达目标行为
  const arriveBehavior = new YUKA.ArriveBehavior(target.position);
  vehicle.steering.add(arriveBehavior);

  // 创建实体管理对象
  entityManager = new YUKA.EntityManager();
  entityManager.add(vehicle);
  entityManager.add(target);
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