<!-- 56.2.各类型光照详解 -->
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
  createCamera(0, 10, 50);
  createRenderer();
  createAxes();
  // createAmbientTexture();
  createAmbientLight();
  // createDirLight();
  // createPointLight();
  // createSpotLight();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  // 地面
  const planeSize = 40;
  const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
  const planeMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    side: THREE.DoubleSide,
  });
  const floor = new THREE.Mesh(planeGeo, planeMat);
  floor.rotation.x = Math.PI * -.5;
  scene.add(floor);

  // 立方体
  const cubeSize = 4;
  const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMat = new THREE.MeshPhongMaterial({ color: '#8AC' });
  const cube = new THREE.Mesh(cubeGeo, cubeMat);
  cube.position.set(cubeSize + 1, cubeSize / 2, 0);
  scene.add(cube);

  // 球体
  const sphereRadius = 3;
  const sphereWidthDivisions = 32;
  const sphereHeightDivisions = 16;
  const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
  const sphereMat = new THREE.MeshPhongMaterial({ color: '#CA8' });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.set(-sphereRadius - 1, sphereRadius + 2, 0);
  scene.add(sphere);

  // 控制颜色属性gui
  class ColorGUIHelper {
    constructor(object, prop) {
      this.object = object;
      this.prop = prop;
    }
    get value() {
      return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
      this.object[this.prop].set(hexString);
    }
  }

  // 控制角度属性
  class DegRadHelper {
    constructor(obj, prop) {
      this.obj = obj;
      this.prop = prop;
    }
    get value() {
      return THREE.MathUtils.radToDeg(this.obj[this.prop]);
    }
    set value(v) {
      this.obj[this.prop] = THREE.MathUtils.degToRad(v);
    }
  }

  // 创建gui组
  function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
    folder.add(vector3, 'y', -10, 10).onChange(onChangeFn);
    folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
    folder.open();
  }

  // 更新光线对象和辅助对象
  function updateLight() {
    light.target.updateMatrixWorld();
    helper.update();
  }

  /*
  // 环境光
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.AmbientLight(color, intensity);
  scene.add(light);
  // gui
  gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
  gui.add(light, 'intensity', 0, 2, 0.01);
  // */


  /*
  // 半球光
  const skyColor = 0xB1E1FF;  // light blue
  const groundColor = 0xB97A20;  // brownish orange
  const intensity = 1;
  const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
  scene.add(light);
  // gui
  gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('skyColor');
  gui.addColor(new ColorGUIHelper(light, 'groundColor'), 'value').name('groundColor');
  gui.add(light, 'intensity', 0, 2, 0.01);
  // */


  /*
  // 方向光
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(0, 10, 0);
  light.target.position.set(-5, 0, 0);
  scene.add(light);
  scene.add(light.target);
  // // gui
  // 创建无辅助对象的gui
  // gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
  // gui.add(light, 'intensity', 0, 2, 0.01);
  // gui.add(light.target.position, 'x', -10, 10);
  // gui.add(light.target.position, 'z', -10, 10);
  // gui.add(light.target.position, 'y', 0, 10);
  // 创建有辅助对象的gui
  // 方向光辅助对象
  const helper = new THREE.DirectionalLightHelper(light);
  scene.add(helper);
  // gui
  gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
  gui.add(light, 'intensity', 0, 2, 0.01);
  makeXYZGUI(gui, light.position, 'position', updateLight);
  makeXYZGUI(gui, light.target.position, 'target', updateLight);
  // */


  /*
  // 点光源
  const color = 0xFFFFFF;
  const intensity = 10;
  const light = new THREE.PointLight(color, intensity);
  light.position.set(0, 10, 0);
  scene.add(light);
  // 点光源辅助对象
  const helper = new THREE.PointLightHelper(light);
  scene.add(helper);
  // gui
  gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('color');
  gui.add(light, 'intensity', 0, 100, 1);
  gui.add(light, 'distance', 0, 40).onChange(updateLight);
  makeXYZGUI(gui, light.position, 'position', updateLight);
  // */


  // /*
  // 聚光灯
  const color = 0xffffff;
  const intensity = 10;
  const light = new THREE.SpotLight(color, intensity);
  light.position.set(0, 10, 0);
  scene.add(light);
  scene.add(light.target);
  // helper
  const helper = new THREE.SpotLightHelper(light);
  scene.add(helper);
  // gui
  gui.add(light, 'penumbra', 0, 1, 0.01);
  gui.add(light, 'distance', 0, 40).onChange(updateLight);
  gui.add(light, 'intensity', 0, 1000, 1);
  gui.add(new DegRadHelper(light, 'angle'), 'value', 0, 90)
    .name('angle')
    .onChange(updateLight);
  // */


  // todo: 矩形区域光
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