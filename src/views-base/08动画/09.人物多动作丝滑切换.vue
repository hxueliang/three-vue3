<!-- 09.人物多动作丝滑切换 -->
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

init();

// 初始化
function init() {
  createScene();
  createCamera(3, 3, 10);
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
  let walkAction, runAction, posAction, greetAction, idleAction;
  let currentAction;
  gltfLoader.load('./model/animate/hilda_regular_00.glb', (gltf) => {
    console.log(gltf.animations);
    scene.add(gltf.scene);
    // 创建动画混合器
    mixer = new THREE.AnimationMixer(gltf.scene);
    console.log(mixer);
    // 获取动画
    walkAction = mixer.clipAction(gltf.animations[37]);
    runAction = mixer.clipAction(gltf.animations[27]);
    posAction = mixer.clipAction(gltf.animations[23]);
    greetAction = mixer.clipAction(gltf.animations[0]);
    idleAction = mixer.clipAction(gltf.animations[6]);
    idleAction.play();
    currentAction = idleAction;
  });

  const playAction = (action) => {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(1);
    action.play();
    currentAction.crossFadeTo(action, 0.5, true);
    currentAction = action;
  };

  const eventObject = {
    stopAll() {
      mixer.stopAllAction();
    },
    play() {
      mixer._actions.forEach(action => {
        action.play();
      });
    },
    playWalk() {
      playAction(walkAction);
    },
    playRun() {
      playAction(runAction);
    },
    playPos() {
      playAction(posAction);
    },
    playGreet() {
      playAction(greetAction);
    },
    playIdle() {
      playAction(idleAction);
    },
  };

  gui.add(eventObject, 'stopAll');
  gui.add(eventObject, 'play');
  gui.add(eventObject, 'playWalk');
  gui.add(eventObject, 'playRun');
  gui.add(eventObject, 'playPos');
  gui.add(eventObject, 'playGreet');
  gui.add(eventObject, 'playIdle');
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