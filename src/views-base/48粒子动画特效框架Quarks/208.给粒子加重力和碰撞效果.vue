<!-- 208.给粒子加重力和碰撞效果 -->

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
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
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
  BatchedRenderer,
  ConstantValue,
  IntervalValue,
  PointEmitter,
  ConstantColor,
  RenderMode,
  ParticleSystem,
  ColorOverLife,
  ColorRange,
  SizeOverLife,
  PiecewiseBezier,
  Bezier,
  FrameOverLife,
  BatchedParticleRenderer,
  RandomColor,
  ConeEmitter,
  RotationOverLife,
} from "three.quarks";

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

// 渲染函数
let batchRenderer;

init();

// 初始化
function init() {
  createScene();
  createCamera(12, 10, 20);
  createRenderer();
  createAxes();
  createGrid(30, 30);
  // createAmbientTexture();
  // createAmbientLight();
  // createDirLight();
  // createPointLight();
  // createSpotLight();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  // 创建粒子批量渲染器
  batchRenderer = new BatchedParticleRenderer();
  // 添加粒子渲染器
  scene.add(batchRenderer);

  // 加载粒子的纹理
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("./texture/quarks/particle_default.png");

  const particles = new ParticleSystem({
    // 粒子动画的时间
    duration: 2,
    // 粒子是否循环播放
    looping: false,
    // 粒子开始的时间
    startLife: new IntervalValue(0, 1),
    // 粒子开始的速度
    startSpeed: new IntervalValue(0, 1),
    // 粒子开始的尺寸
    startSize: new IntervalValue(0, 0.2),
    // 粒子开始的颜色
    startColor: new RandomColor(
      new THREE.Vector4(1, 0.91, 0.51, 1),
      new THREE.Vector4(1, 0.44, 0.16, 1)
    ),
    worldSpace: true,
    // 粒子最大的数量
    maxParticles: 1000,
    emissionOverTime: new ConstantValue(1000),
    shape: new PointEmitter(),
    material: new THREE.MeshBasicMaterial({
      map: texture,
      blending: THREE.AdditiveBlending,
      transparent: true,
      side: THREE.DoubleSide,
    }),
    renderMode: RenderMode.BillBoard,
    rendererOrder: 1,
  });

  particles.emitter.name = "particles";
  scene.add(particles.emitter);
  batchRenderer.addSystem(particles);

  let options = {
    emitParticles: function () {
      particles.emitEnded = false;
      particles.time = 0;
    },
  };
  document.addEventListener("click", options.emitParticles);
}

// 创建场景
function createScene() {
  scene = new THREE.Scene();
}

// 创建相机
function createCamera(x = 0, y = 0, z = 10, lookAtX = 0, lookAtY = 0, lookAtZ = 0) {
  camera = new THREE.PerspectiveCamera(25, innerWidth / innerHeight, 0.1, 3000);
  camera.position.set(x, y, z);
  camera.lookAt(lookAtX, lookAtY, lookAtZ);
  scene.add(camera);
}


// 创建渲染器
function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
}

// 创建渲染函数
function render() {
  const delta = clock.getDelta();

  if (batchRenderer) {
    batchRenderer.update(delta);
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
function createAxes(size = 5) {
  const axesHelper = new THREE.AxesHelper(size);
  scene.add(axesHelper);
}

// 添加网格辅助器
function createGrid(size = 10, divisions = 10, opacity = 0.3) {
  const gridHelper = new THREE.GridHelper(size, divisions);
  gridHelper.material.opacity = opacity;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);
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