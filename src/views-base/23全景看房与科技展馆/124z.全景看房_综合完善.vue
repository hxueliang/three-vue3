<!-- 124z.全景看房_综合完善 -->
<template>
  <div class="container" ref="container"></div>
  <!-- 123.0 地置和地图 -->
  <div class="map">
    <div class="tag" ref="tagDiv"></div>
    <img src="../../assets/imgs/room/map.gif" alt="" />
  </div>
  <!-- 123.0 进度和loading -->
  <div class="loading" v-if="progress != 100"></div>
  <div class="progress" v-if="progress != 100">
    <img src="../../assets/imgs/room/loading.gif" alt="" />
    <span>新房奔跑中：{{ progress }}%</span>
  </div>
  <div class="title">VR全景看房</div>
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

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
const container = ref(null);
// 123.0 初始化
const tagDiv = ref(null);
const progress = ref(0);

// const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let scene, camera, renderer, cantrols;

init();

// 初始化
function init() {
  createScene();
  createCamera(0, 0, 0);
  createRenderer();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  addMouseEvent();
  createLivingroom();
  createKitchen();
  createBalcony();
  loadingManager();
}

// 121.0.1 创建房间工厂
class Room {
  constructor(
    name,
    roomIndex,
    textureUrl,
    position = new THREE.Vector3(0, 0, 0),
    euler = new THREE.Euler(0, 0, 0),
  ) {
    this.name = name;
    // 121.1.1 创建客厅
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    geometry.scale(1, 1, -1); // 让镜头到盒子内部
    const textureNames = [
      `${roomIndex}_l`,
      `${roomIndex}_r`,
      `${roomIndex}_u`,
      `${roomIndex}_d`,
      `${roomIndex}_b`,
      `${roomIndex}_f`,
    ];
    // 121.1.2 创建6个页面的材质
    const textureBox = textureNames.map((item, index) => {
      const texture = new THREE.TextureLoader().load(textureUrl + item + ".jpg");
      // 上下两张贴图方向不对，要旋转一下
      if ([`${roomIndex}_u`, `${roomIndex}_d`].includes(item)) {
        texture.rotation = Math.PI;
        texture.center = new THREE.Vector2(0.5, 0.5);
      }
      return new THREE.MeshBasicMaterial({ map: texture });
    });
    const cube = new THREE.Mesh(geometry, textureBox);
    cube.position.copy(position);
    cube.rotation.copy(euler);
    scene.add(cube);
  }
}

// 121.0.2 监听鼠标事件
function addMouseEvent() {
  // 121.2 监听鼠标事件，实现拖动画面
  let isMouseDown = false;
  container.value.addEventListener('mousedown', _ => isMouseDown = true, false);
  container.value.addEventListener('mouseup', _ => isMouseDown = false, false);
  container.value.addEventListener('mouseout', _ => isMouseDown = false, false);
  container.value.addEventListener('mousemove', event => {
    if (!isMouseDown) { return; }
    camera.rotation.y += event.movementX * 0.002;
    camera.rotation.x += event.movementY * 0.002;
    camera.rotation.order = 'YXZ'; // 顺序
  }, false);
}

// 121.1 创建客厅
function createLivingroom() {
  const livingroom = new Room('客厅', 0, './imgs/livingroom/');
  // 123.1.1 初始化tag在客厅
  tagDiv.value.style.cssText = `transform: translate(100px, 115px);`;
}

// 121.2.0 创建精灵
class SpriteText {
  constructor(text, position) {
    this.callbacks = [];
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext("2d");
    context.fillStyle = "rgba(100, 100, 100, 0.7)";
    context.fillRect(0, 256, 1024, 512);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "bold 200px Arial";
    context.fillStyle = "white";
    context.fillText(text, 512, 512);
    let texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(0.5, 0.5, 0.5);
    sprite.position.copy(position);
    this.sprite = sprite;
    scene.add(sprite);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    window.addEventListener('click', event => {
      mouse.x = event.clientX / window.innerWidth * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight * 2 - 1);
      raycaster.setFromCamera(mouse, camera);
      let intersects = raycaster.intersectObject(sprite);
      if (intersects.length > 0) {
        this.callbacks.forEach(callback => {
          callback();
        });
      }
    });
  }

  onClick(callback) {
    this.callbacks.push(callback);
  }
}

// 121.2 创建厨房
function createKitchen() {
  const kitchenPosition = new THREE.Vector3(-5, 0, -10);
  const kitchenEuler = new THREE.Euler(0, -Math.PI / 2, 0);
  const kitchen = new Room('厨房', 3, './imgs/kitchen/', kitchenPosition, kitchenEuler);
  // 121.2.1 创建厨房文字
  const kitchenTextPosition = new THREE.Vector3(-1.5, 0, -4);
  const kitchenText = new SpriteText('厨房', kitchenTextPosition);
  // 121.2.2 让相机移动到厨房
  kitchenText.onClick(() => {
    gsap.to(camera.position, {
      x: kitchenPosition.x,
      y: kitchenPosition.y,
      z: kitchenPosition.z,
      duration: 1,
    });
    moveTag('厨房');
  });
  // 121.2.3 创建厨房回到客厅
  const kitchenBackTextPosition = new THREE.Vector3(-4, 0, -6);
  const kitchenBackText = new SpriteText('客厅', kitchenBackTextPosition);
  kitchenBackText.onClick(() => {
    gsap.to(camera.position, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1,
    });
    moveTag('客厅');
  });
}

// 121.3 创建阳台
function createBalcony() {
  const position = new THREE.Vector3(0, 0, 13);
  const euler = new THREE.Euler(0, 0, 0);
  const room = new Room('阳台', 8, './imgs/balcony/', position, euler);
  // 121.2.1 创建文字
  const textPosition = new THREE.Vector3(0, 0, 3);
  const text = new SpriteText('阳台', textPosition);
  // 121.2.2 让相机移动到
  text.onClick(() => {
    gsap.to(camera.position, {
      x: position.x,
      y: position.y,
      z: position.z,
      duration: 1,
    });
    moveTag('阳台');
  });
  // 121.2.3 创建回到客厅
  const backTextPosition = new THREE.Vector3(-1, 0, 11);
  const backText = new SpriteText('客厅', backTextPosition);
  backText.onClick(() => {
    gsap.to(camera.position, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1,
    });
    moveTag('客厅');
  });
}

// 123.1 移动位置的方法
function moveTag(name) {
  let positionMap = {
    客厅: [100, 115],
    厨房: [185, 170],
    阳台: [66, 64],
  };
  if (positionMap[name]) {
    gsap.to(tagDiv.value, {
      x: positionMap[name][0],
      y: positionMap[name][1],
      duration: 0.5,
      ease: 'power3.inOut',
    });

  }
}

// 124.1 加载管理
function loadingManager() {
  THREE.DefaultLoadingManager.onProgress = (item, num, total) => {
    let progressValue = ((num / total) * 100).toFixed(2);
    progress.value = progressValue;
  };
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
  render();
});
</script>

<style lang="less" scope>
.container {
  width: 100vw;
  height: 100vh;
}

// 123.0 图地和loading
.map {
  width: 300px;
  height: 260px;
  position: absolute;
  left: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);

  img {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }

  .tag {
    position: absolute;
    top: 0;
    left: 0;
    width: 30px;
    height: 30px;
    background-image: url(../../assets/imgs/room/location.png);
    background-size: cover;
    z-index: 1;
  }
}

.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url(../../assets/imgs/room/loading.png);
  background-size: cover;
  filter: blur(50px);
  z-index: 100;
}

.progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 101;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  color: #fff;

  img {
    padding: 0 15px;
  }
}
</style>
<style>
body {
  background-color: #1e1a20;
}
</style>