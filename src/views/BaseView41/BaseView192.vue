<!-- 192.光线效果增强与调整 -->
<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import gsap from 'gsap';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

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

import { enhanceShaderLighting } from "enhance-shader-lighting";

import {
  EffectComposer,
  RenderPass,
  BlendFunction,
  BloomEffect,
  EffectPass,
} from 'postprocessing';

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

let composer;

init();

// 初始化
function init() {
  createScene();
  createCamera(0, 2, 20);
  createRenderer();
  createAxes();
  createAmbientTexture();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {

  const options = {
    aoColor: new THREE.Color(0x000000),
    hemisphereColor: new THREE.Color(0xffffff),
    irradianceColor: new THREE.Color(0xffffff),
    radianceColor: new THREE.Color(0xffffff),

    aoPower: 1,
    aoSmoothing: 0,
    aoMapGamma: 1,
    // lightMapGamma: 1,
    // lightMapSaturation: 1,
    envPower: 1,
    roughnessPower: 1,
    sunIntensity: 0,
    mapContrast: 1,
    lightMapContrast: 1,
    smoothingPower: 0.25,
    irradianceIntensity: Math.PI,
    radianceIntensity: 1,

    hardcodeValues: false,
  };
  const shaderArr = [];
  gltfLoader.load('./model/light/gym.optimized.glb', gltf => {
    gltf.scene.traverse(child => {
      if (!child.isMesh) {
        return;
      }
      child.material.onBeforeCompile = shader => {
        shaderArr.push(shader);
        enhanceShaderLighting(shader, options);
      };
    });
    scene.add(gltf.scene);
  });

  // 添加gui
  for (let option in options) {
    if (option.indexOf('Color') !== -1) {
      gui.addColor(options, option).onChange(value => {
        updateShaderLighting(shaderArr, option, value);
      });
    } else if (option !== 'hardcodeValues') {
      gui.add(options, option).min(0).max(10).step(0.1).onChange(value => {
        updateShaderLighting(shaderArr, option, value);
      });
    }
  }

  composer = new EffectComposer(renderer, {
    // 设置抗锯齿多采样
    multisampling: Math.max(4, renderer.capabilities.maxSamples)
  });
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new EffectPass(camera, new BloomEffect({
    intensity: 5,
    luminanceThreshold: 0.5,
    luminanceSmoothing: 1.0
  })));
}

// 更新着色器
function updateShaderLighting(shaderArr, option, value) {
  shaderArr.forEach(shader => {
    shader.uniforms[option] && (shader.uniforms[option].value = value);
  });
}

// 创建场景
function createScene() {
  scene = new THREE.Scene();
}

// 创建相机
function createCamera(x = 0, y = 0, z = 10) {
  camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 1, 10000);
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
  // renderer.render(scene, camera);
  composer.render();
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
  rgbeLoader.load('./hdr//kloofendal_48d_partly_cloudy_1k.hdr', texture => {
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