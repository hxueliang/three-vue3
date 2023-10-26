<!-- 04判断是否在扇形内 -->
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
import { DoubleSide } from 'three';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
const container = ref(null);

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/");
gltfLoader.setDRACOLoader(dracoLoader);

let scene, camera, renderer, controls;

init();

// 初始化
function init() {
  createScene();
  createCamera(5, 3, 20);
  createRenderer();
  createAxes();
  // createAmbientTexture();
  createAmbientLight();
  createDirLight();
  // createPointLight();
  // createSpotLight();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  // 人
  const person = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 1),
    new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true })
  );
  scene.add(person);
  // 物
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true })
  );
  scene.add(mesh);

  // 已知数据
  // 人位置
  person.position.set(0, 0, 2);
  // 物体位置
  mesh.position.set(2, 0, -3); // in
  // mesh.position.set(2, 0, -5); // out
  // mesh.position.set(5, 0, -3); // out
  // a向量：人的正前方沿着z轴负半轴
  const a = new THREE.Vector3(0, 0, -1);
  // 扇形范围
  const R = 6; // 人前方扇形半径
  const angle = 60; // 人前方扇形角度

  // 创建b向量：一个人指向物体的向量，用物体坐标减去人坐标
  const b = mesh.position.clone().sub(person.position);

  // 创建辅助箭头，方便直观理解
  const arrowA = new THREE.ArrowHelper(a.clone().normalize(), person.position, a.length(), 0x00ff00);
  const arrowB = new THREE.ArrowHelper(b.clone().normalize(), person.position, b.length(), 0xff0000);
  scene.add(arrowA, arrowB);
  // 创建辅助扇形，方便直观理解
  const circle = new THREE.Mesh(
    new THREE.CircleGeometry(
      R,
      12,
      THREE.MathUtils.degToRad((180 - angle) / 2), // 第一个分段的起始角度
      THREE.MathUtils.degToRad(angle) // 圆形扇区的中心角
    ),
    new THREE.MeshBasicMaterial({ color: 0x00ff00, side: DoubleSide, wireframe: true })
  );
  circle.rotation.x = -Math.PI / 2;
  circle.position.copy(person.position);
  scene.add(circle);

  const res = getInOutCircle(a, b, R, angle);
  console.log(res);
}

function getInOutCircle(a, b, R, angle) {
  // 物体与人的距离
  const L = b.length();
  if (L > R) {
    return 'out';
  }

  // 向量a和b夹角余弦值
  const cos = a.clone().normalize().dot(b.clone().normalize());
  // 角度转弧度
  const rad = THREE.MathUtils.degToRad(angle);
  // 扇形角度一半的余弦值
  const rangeCos = Math.cos(rad / 2);
  // 比较向量a、b夹角余弦值cos和扇形角度一半的余弦值rangeCos大小，判断物体是否在扇形内
  if (cos > rangeCos) { // 物体在人前方扇形里面
    return 'in';
  } else {
    return 'out';
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
  renderer.setSize(innerWidth, innerHeight);
}

// 创建渲染函数
function render() {
  const elapsed = clock.getElapsedTime();

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

// 添加环境纹理
function createAmbientTexture() {
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load('./hdr/noon_grass_1k.hdr', texture => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  });
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
function createSpotLight(x = 0, y = 0, z = 10, strength = 1000, color = '#ffffff', castShadow = false) {
  const light = new THREE.SpotLight(color, strength);
  light.position.set(x, y, z);
  light.castShadow = castShadow;
  scene.add(light);
  return light;
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