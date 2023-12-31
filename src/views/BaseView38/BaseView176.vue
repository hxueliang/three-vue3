<!-- 176.偏移追击行为 -->
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
  createCamera(10, 120, 80);
  createRenderer();
  createSpotLight(10, 70, 10, 20000, 0xffffff, 100, Math.PI / 8, 0.5, true);
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  // 创建平面
  const planeGeometry = new THREE.PlaneGeometry(80, 80);
  const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -1;
  scene.add(plane);

  // 创建实体管理对象
  entityManager = new YUKA.EntityManager();

  // 设置物理属性回调
  function callback(entity, renderComponent) {
    renderComponent.position.copy(entity.position);
    renderComponent.quaternion.copy(entity.rotation);
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
  setPosition(target);

  // 设置随机位置
  function setPosition(obj) {
    obj.position.set(Math.random() * 50 - 20, 0, Math.random() * 50 - 25);
  }
  entityManager.add(target);

  // 加载汽车模型
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./draco/');
  gltfLoader.setDRACOLoader(dracoLoader);
  const c1 = gltfLoader.loadAsync('./model/yuka/car.gltf');
  const c2 = gltfLoader.loadAsync('./model/yuka/truck.gltf');
  Promise.all([c1, c2]).then(res => {
    const [car, truck] = res.map(item => item.scene);
    car.children[0].rotation.y = Math.PI / 2;
    car.children[0].scale.set(0.5, 0.5, 0.5);
    // 创建yuka的车辆
    const vehicle1 = new YUKA.Vehicle();
    vehicle1.maxSpeed = 6;
    setPosition(vehicle1);
    vehicle1.setRenderComponent(car, callback);
    // 添加实体
    entityManager.add(vehicle1);

    truck.children[0].rotation.y = Math.PI / 2;
    truck.children[0].scale.set(0.5, 0.5, 0.5);
    // 创建yuka的车辆
    const vehicle2 = new YUKA.Vehicle();
    vehicle2.maxSpeed = 5;
    setPosition(vehicle2);
    vehicle2.setRenderComponent(truck, callback);
    // 添加实体
    entityManager.add(vehicle2);

    scene.add(car);
    scene.add(truck);

    // 设置小车偏移追击货车行为
    const offsetPursuitBehavior = new YUKA.OffsetPursuitBehavior(
      vehicle2,
      new YUKA.Vector3(0, 0, 1)
    );
    vehicle1.steering.add(offsetPursuitBehavior);

    // 设置货车到达目标行为
    const arriveBehavior = new YUKA.ArriveBehavior(target.position);
    vehicle2.steering.add(arriveBehavior);

    // 5秒切换目标位置
    setInterval(() => {
      setPosition(target);
    }, 5000);
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