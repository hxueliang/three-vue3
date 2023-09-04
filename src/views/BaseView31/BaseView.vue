<!-- 133.3D地图 -->
<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import gsap from 'gsap';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as d3 from 'd3';
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
import { MeshBasicMaterial } from 'three';

innerWidth = window.innerWidth;
innerHeight = window.innerHeight;
const container = ref(null);

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let scene, camera, renderer, controls;

init();

// 初始化
function init() {
  createScene();
  createCamera(0, 0, 500);
  createRenderer();
  createAxes();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  // 加载geojson文件
  const loader = new THREE.FileLoader();
  loader.load('./json/100000_full.json', data => {
    const json = JSON.parse(data);
    console.log(json);
    operationData(json);
  });
}

// 存放所有省份
const map = new THREE.Object3D();

// 操作数据
function operationData(json) {
  const { features } = json;
  features.forEach(feature => {
    // 创建省份mesh
    const province = new THREE.Object3D();
    const { name } = feature.properties;
    // 获取经纬度坐标
    const { geometry } = feature;
    const { coordinates, type } = geometry;

    if (type === 'Polygon') {
      coordinates.forEach(coordinate => {
        const mesh = createMesh(coordinate);
        mesh.name = name;
        province.add(mesh);
      });
    }

    if (type === 'MultiPolygon') {
      coordinates.forEach(item => {
        item.forEach(coordinate => {
          const mesh = createMesh(coordinate);
          mesh.name = name;
          province.add(mesh);
        });
      });
    }

    map.add(province);
  });

  scene.add(map);
}

// 使用d3的坐标转换方法
// 设置geoMercator的中心坐标
// geoMercator可以将球型坐标置换为平面坐标
// translate将中心转称到(0,0,0)
const properties = d3.geoMercator().center([116.5, 38.5]).translate([0, 0, 0]);

// 创建物体
function createMesh(polygon) {
  const shape = new THREE.Shape();
  polygon.forEach((row, i) => {
    const coordinate = properties(row);
    const [longitude, latitude] = coordinate;
    if (i === 0) {
      shape.moveTo(longitude, -latitude); // 由于y轴方向是相反的，所有要取反
    }
    shape.lineTo(longitude, -latitude);
  });

  // 根据形状，挤出几何体
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 5 });
  const color = new THREE.Color(Math.random() * 0xffffff);
  const meterial = new MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.5,
  });
  return new THREE.Mesh(geometry, meterial);
}

// 创建场景
function createScene() {
  scene = new THREE.Scene();
}

// 创建相机
function createCamera(x = 0, y = 0, z = 10) {
  camera = new THREE.PerspectiveCamera(25, innerWidth / innerHeight, 0.1, 5000);
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
</style>
<style>
body {
  background-color: #1e1a20;
}
</style>