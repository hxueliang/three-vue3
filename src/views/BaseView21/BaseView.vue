<!-- 126.通过户型数据生成地面 -->
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

import RoomShapeMesh from "./threeMesh/RoomShapeMesh.js";
import WallShaderMaterial from "./threeMesh/WallShaderMaterial.js";

innerWidth = window.innerWidth;
innerHeight = window.innerHeight;
const container = ref(null);

// const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let scene, camera, renderer, cantrols;

init();

// 初始化
function init() {
  createScene();
  createCamera(0, 2, 5.5);
  createRenderer();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  // 126.1 加载环境贴图
  const texture = textureLoader.load('./imgs/room720/HdrSkyCloudy004_JPG_2K.jpg');
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;

  // 126.2 加载户型数据
  const BASE_RUL = 'https://test-1251830808.cos.ap-guangzhou.myqcloud.com/three_course/';
  // id到全境图的映射
  let idToPanorama = {};
  let panoramaLocation;
  fetch(`${BASE_RUL}/demo720.json`)
    .then(res => res.json())
    .then(obj => {
      console.log(obj);
      const { objData: { roomList } } = obj;
      roomList.forEach(room => {
        // 创建地面
        let roomMesh = new RoomShapeMesh(room);
        let roomMesh2 = new RoomShapeMesh(room, true);
        scene.add(roomMesh, roomMesh2);
        panoramaLocation = obj.panoramaLocation;
        // 房间到全景图的映射
        panoramaLocation.forEach(panorama => {
          if (panorama.roomId === room.roomId) {
            let material = new WallShaderMaterial(panorama);
            panorama.material = material;
            idToPanorama[room.roomId] = panorama;
          }
        });
        roomMesh.material = idToPanorama[room.roomId].material;
        roomMesh.material.side = THREE.DoubleSide;
        roomMesh2.material = idToPanorama[room.roomId].material.clone();
        roomMesh2.material.side = THREE.FrontSide;
        // console.log(idToPanorama);
      });
    });
}

// 创建场景
function createScene() {
  scene = new THREE.Scene();
}

// 创建相机
function createCamera(x = 0, y = 0, z = 10) {
  camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 300);
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
  const elapsed = clock.getElapsedTime();

  cantrols && cantrols.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

// 创建控制器
function createControls() {
  cantrols = new OrbitControls(camera, container.value);
  cantrols.enableDamping = true;
  cantrols.dampingFactor = 0.05;
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

canvas {
  width: 100vw;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}
</style>
<style>
body {
  background-color: #1e1a20;
}
</style>