<!-- 199.碳纤维材质 -->
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

import {
  MeshPhysicalNodeMaterial,
  NodeMaterial,
  checker,
  uv,
  timerLocal,
  vec2,
  texture,
  color,
  normalMap,
  float,
} from 'three/nodes';

// 虽然暂没使用，也需要导入才有棋盘效果
import { nodeFrame } from "three/addons/renderers/webgl/nodes/WebGLNodes.js";

// 珠光漆的法向贴图
import { FlakesTexture } from "three/addons/textures/FlakesTexture.js";

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
  createCamera();
  createRenderer();
  createAxes();
  createAmbientTexture();
  createAmbientLight();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  const material = new THREE.MeshPhysicalMaterial();

  // 在原有的材质上，创建节点材质
  const nodeMaterial = NodeMaterial.fromMaterial(material);

  // 设置碳纤维材质
  const carbonTexture = textureLoader.load('./texture/carbon/Carbon.png');
  carbonTexture.colorSpace = THREE.SRGBColorSpace;
  carbonTexture.wrapS = THREE.RepeatWrapping;
  carbonTexture.wrapT = THREE.RepeatWrapping;
  const carbonNormalTexture = textureLoader.load('./texture/carbon/Carbon_Normal.png');
  carbonNormalTexture.colorSpace = THREE.SRGBColorSpace;
  carbonNormalTexture.wrapS = THREE.RepeatWrapping;
  carbonNormalTexture.wrapT = THREE.RepeatWrapping;
  const carbonUv = uv().mul(5);
  nodeMaterial.colorNode = texture(carbonTexture, carbonUv);
  nodeMaterial.normalNode = normalMap(texture(carbonNormalTexture, carbonUv));

  nodeMaterial.metalnessNode = float(0.9);
  nodeMaterial.roughnessNode = float(0.5);
  nodeMaterial.clearcoatNode = float(1);
  nodeMaterial.clearcoatRoughnessNode = float(0.01);

  const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
  const sphere = new THREE.Mesh(sphereGeometry, nodeMaterial);
  sphere.position.set(2, 0, 0);
  scene.add(sphere);

  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const cube = new THREE.Mesh(boxGeometry, nodeMaterial);
  cube.position.set(-2, 0, 0);
  scene.add(cube);

  const planeGeometry = new THREE.PlaneGeometry(1, 1);
  const plane = new THREE.Mesh(planeGeometry, nodeMaterial);
  scene.add(plane);
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
  nodeFrame.update();
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
  rgbeLoader.load('./hdr/013.hdr', texture => {
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