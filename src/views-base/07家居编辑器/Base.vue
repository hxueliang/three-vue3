<!-- 07家居编辑器 -->
<!-- 
  01.添加户型基础模型
  02.添加物体列表
  03.使用变换控制器操作物体
  04.切换家居
  05.控制家居位称旋转缩放
  06.切换坐标空间
-->
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
// 导入变换控制器
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

let basicScene, transformControls;

const eventObj = {
  // 添加户型基础模型
  addScene: () => { scene.add(basicScene); },
  // 设置位移
  setTranslate: () => { transformControls.setMode("translate"); },
  // 设置旋转
  setRotate: () => { transformControls.setMode("rotate"); },
  // 设置缩放
  setScale: () => { transformControls.setMode("scale"); },
  // 本地空间/世界空间切换
  toggleSpace: () => { transformControls.setSpace(transformControls.space === "local" ? "world" : "local"); },
  // 取消物体选中
  detachMesh: () => { transformControls.detach(); },
};

init();

// 初始化
function init() {
  createScene();
  createCamera(3, 2.5, 8, 0, 1.2, 0);
  createRenderer();
  createAxes(1);
  createGrid(50, 50);
  createAmbientTexture();
  // createAmbientLight();
  // createDirLight();
  // createPointLight();
  // createSpotLight();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  addBasicScene();
  setMode();
  setSpace();
  detachMesh();
  addMeshList();
  createTransformControls();
}

// 添加基础场景
function addBasicScene() {
  gltfLoader.load('./model/house/house-scene-min.glb', gltf => {
    basicScene = gltf.scene;
  });

  // 添加户型基础模型
  gui.add(eventObj, 'addScene').name('添加户型基础模型');
}

// 设置变换类型
function setMode() {
  // 定义枚举对象
  const Mode = {
    t: { fn: 'setTranslate', name: '位移模式', },
    r: { fn: 'setRotate', name: '旋转模式', },
    s: { fn: 'setScale', name: '缩放模式', }
  };
  Object.keys(Mode).forEach(key => {
    gui.add(eventObj, Mode[key].fn).name(`${Mode[key].name}(${key})`);
  });
  // 监听鼠标按键
  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    console.log(key);
    if (key in Mode) {
      eventObj[Mode[key].fn]();
    }
  });
}

// 切换坐标空间
function setSpace() {
  gui.add(eventObj, 'toggleSpace').name('切换坐标空间');
}

// 取消选择物体
function detachMesh() {
  gui.add(eventObj, 'detachMesh',).name('取消选择');
}

// 添加物体列表
function addMeshList(mesh) {
  // 添加物体目录
  const meshList = [
    { name: '盆栽', path: './model/house/plants-min.glb' },
    { name: '沙发', path: './model/house/sofa_chair_min.glb' },
  ];

  // 场景的物体列表
  const sceneMesList = [];
  const folderAddMesh = gui.addFolder('添加物体');
  const folderMesh = gui.addFolder('家居列表');
  const meshNum = {}; // 记录每个物体添加的数量

  // 遍历物体列表，添加到 sceneMesList 和 folder
  meshList.forEach(item => {
    item.addMesh = () => {
      gltfLoader.load(item.path, gltf => {
        const mesh = gltf.scene;
        sceneMesList.push({
          ...item,
          object3D: mesh,
        });
        scene.add(mesh);
        selectMesh(mesh);

        // 切换家居
        const meshOpt = {
          toggleMesh: () => {
            selectMesh(mesh);
          },
        };
        meshNum[item.name] = meshNum[item.name] ? meshNum[item.name] + 1 : 1;
        folderMesh.add(meshOpt, 'toggleMesh').name(item.name + meshNum[item.name]);
      });
    };
    folderAddMesh.add(item, 'addMesh').name(item.name);
  });
}

// 选中物体
function selectMesh(mesh) {
  transformControls.attach(mesh);
}

// 创建变换控制器
function createTransformControls() {
  transformControls = new TransformControls(camera, container.value);
  transformControls.addEventListener('change', render);
  transformControls.addEventListener('dragging-changed', function (event) {
    controls.enabled = !event.value;
  });
  scene.add(transformControls);
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
    scene.background = new THREE.Color(0xcccccc);
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
  background-color: #CCC;
}
</style>