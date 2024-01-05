<!-- 119.变形动画初体验 -->
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

const innerWidth = window.innerWidth;
const innerHeight = window.innerHeight;
const container = ref(null);

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let scene, camera, renderer, cantrols;

init();

// 初始化
function init() {
  createScene();
  createCamera();
  createCode();
  createRenderer();
  createAxes();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  // 119.0 添加hdr环境纹理
  const rgbeloader = new RGBELoader();
  rgbeloader.load("./hdr/038.hdr", function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  });

  // 119.5 参数
  const params = {
    value: 0, // 初始值为0
  };

  // 119.1 加载压缩的glb模型
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("./draco/gltf/");
  dracoLoader.setDecoderConfig({ type: "js" });
  dracoLoader.preload();
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load("./model/sphere/sphere1.glb", function (gltf1) {
    let sphere1 = gltf1.scene.getObjectByName('棱角球');

    gltfLoader.load("./model/sphere/sphere2.glb", function (gltf2) {
      let sphere2 = gltf2.scene.getObjectByName('棱角球');

      // 119.2 给sphere1添加需要变形的位置数据
      sphere1.geometry.morphAttributes.position = [];
      sphere1.geometry.morphAttributes.position.push(
        sphere2.geometry.attributes.position
      );
      // 119.3 更新morphTargets，使其不对对象产生影响（必须加上这句代码，否则前两句代码报错）
      sphere1.updateMorphTargets();
      // 119.4 使用补间动画完成形变
      gsap.to(params, {
        value: 1, // 改变value
        duration: 2,
        repeat: -1,
        yoyo: true,
        onUpdate() {
          sphere1.morphTargetInfluences[0] = params.value;
        }
      });
    });

    scene.add(gltf1.scene);
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
  const innerWidth = window.innerWidth;
  const innerHeight = window.innerHeight;
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}

// 添加画布进DOM
function appendCanvas() {
  container.value.appendChild(renderer.domElement);
}

onMounted(() => {
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