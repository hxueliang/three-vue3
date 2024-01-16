<!-- 07.numberkeyframe数值动画 -->
<!-- 05.布尔关键帧实现闪烁的星球 -->
<!-- 04.布尔关键帧实现闪烁 -->
<!-- 03.四元数与欧拉角转换设置关键帧动画 -->
<!-- 02.设置keyframe关键帧实现动画 -->
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

let mixer;
let mixer2;

init();

// 初始化
function init() {
  createScene();
  createCamera(6, 6, 15);
  createRenderer();
  createAxes();
  // createGrid();
  createAmbientTexture();
  createAmbientLight();
  // createDirLight();
  // createPointLight();
  // createSpotLight();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  // 创建立方体
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff33ff,
  });
  const cube = new THREE.Mesh(geometry, material);
  cube.name = 'cube1';
  scene.add(cube);

  // 创建位移关键帧
  const positionKF = createPositionKF();
  // 创建旋转关键帧1
  const rotationKF1 = createRotationKF1();
  // 创建旋转关键帧2
  const rotationKF2 = createRotationKF2();
  // 创建布尔关键帧
  const boolKF = createBooleanKF();

  // 创建混合器
  mixer = new THREE.AnimationMixer(cube);
  // 创建动画剪辑
  const clip = new THREE.AnimationClip('move', 2, [
    positionKF,
    rotationKF1,
    rotationKF2,
    boolKF,
  ]);
  // 创建动画动作
  const animationAction = mixer.clipAction(clip);
  // 播放动画
  animationAction.play();

  // 加载星球
  gltfLoader.load('./model/animate/moon.glb', gltf => {
    const moon = gltf.scene;
    moon.position.set(-2, 0, 0);
    scene.add(moon);

    // 创建混合器
    mixer2 = new THREE.AnimationMixer(moon);
    // 创建布尔关键帧
    const boolKF = createBooleanKF('Sketchfab_Scene.visible');
    // 创建动画剪辑
    const clip = new THREE.AnimationClip('bool', 2, [
      boolKF,
    ]);
    // 创建动画动作
    const animationAction = mixer2.clipAction(clip);
    // 播放动画
    animationAction.play();
  });
}

// 创建位移关键帧
function createPositionKF() {
  return new THREE.VectorKeyframeTrack(
    'cube1.position',
    [0, 0.5, 1, 1.5, 2], // 时间点
    [
      0, 0, 0,
      2, 0, 0,
      2, 0, 2,
      0, 0, 2,
      0, 0, 0,
    ], // 位置数组
  );
}

// 创建旋转关键帧1
function createRotationKF1() {
  // 创建3个四元数
  // 表示初始旋转状态
  const quaternion1 = new THREE.Quaternion();
  quaternion1.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0);
  // 表示中间旋转状态
  const quaternion2 = new THREE.Quaternion();
  quaternion2.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
  // 表示最终旋转状态
  const quaternion3 = new THREE.Quaternion();
  quaternion3.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI * 2);
  // 转为数组
  const finQ = [
    ...quaternion1.toArray(),
    ...quaternion2.toArray(),
    ...quaternion3.toArray(),
  ];
  console.log(quaternion1, quaternion2, quaternion3, finQ);

  return new THREE.QuaternionKeyframeTrack(
    'cube1.quaternion',
    [0, 1, 2], // 时间点
    finQ, // 四元数数组
  );
}

// 创建旋转关键帧2
function createRotationKF2() {
  // 创建3个四元数
  // 表示初始旋转状态
  const quaternion1 = new THREE.Quaternion();
  quaternion1.setFromEuler(new THREE.Euler(0, 0, 0));
  // 表示中间旋转状态
  const quaternion2 = new THREE.Quaternion();
  quaternion2.setFromEuler(new THREE.Euler(0, Math.PI, 0));
  // 表示最终旋转状态
  const quaternion3 = new THREE.Quaternion();
  quaternion3.setFromEuler(new THREE.Euler(0, Math.PI * 2, 0));
  // 转为数组
  const finQ = [
    ...quaternion1.toArray(),
    ...quaternion2.toArray(),
    ...quaternion3.toArray(),
  ];
  console.log(quaternion1, quaternion2, quaternion3, finQ);

  return new THREE.QuaternionKeyframeTrack(
    'cube1.quaternion',
    [0, 1, 2], // 时间点
    finQ, // 四元数数组
  );
}

// 创建布尔关键帧
function createBooleanKF(key = 'cube1.visible') {
  return new THREE.BooleanKeyframeTrack(
    key,
    [0, 0.65, 0.85, 1.75, 1.85], // 时间点
    [true, false, true, false, true], // 布尔值数组
  );
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

  mixer?.update(delta);
  mixer2?.update(delta);

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