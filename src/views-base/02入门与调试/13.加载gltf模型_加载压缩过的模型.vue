<!-- 13.加载gltf模型_加载压缩过的模型 -->
<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(1, 2, 3);
scene.add(camera);

// 12.3 创建指数雾
scene.fog = new THREE.FogExp2(0x999999, 0.1);
// 12.4 设置场景背景与雾同色
scene.background = new THREE.Color(0x999999);

// 13.1 实例化加载器gltf
const gltfLoader = new GLTFLoader();
// 13.2 加载鸭子模型
gltfLoader.load('./model/Duck.glb', gltf => { // glb: 二进制数据，gltf: json数据
  scene.add(gltf.scene);
});
// 13.4 加载城市模型
// 13.4.1 实例化加载器draco
const dracoLoader = new DRACOLoader();
// 13.4.2 设置draco路径
dracoLoader.setDecoderPath('./draco/'); // /node_modules/three/examples/jsm/libs/draco
// 13.4.3 为gltf加载器设置draco解码器
gltfLoader.setDRACOLoader(dracoLoader);
// 13.4.4 加载压缩过的城市模型
gltfLoader.load('./model/city.glb', gltf => { // glb: 二进制数据，gltf: json数据
  scene.add(gltf.scene);
});
// 13.3 加载环境贴图
const rgbeLoader = new RGBELoader();
rgbeLoader.load('./texture/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = envMap;
});

const gui = new GUI();

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);

// 1.6 创建控制器
let cantrols = null;
function createControls() {
  cantrols = new OrbitControls(camera, container.value);
  cantrols.enableDamping = true;
  cantrols.dampingFactor = 0.05; // 阻尼：值越大惯性越小，0不能动

  container.value.appendChild(renderer.domElement);
}

// 1.7 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 1.5 创建渲染函数
function render() {
  cantrols && cantrols.update();

  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

// 4.1 监听视口变化
window.addEventListener('resize', () => {
  const innerWidth = window.innerWidth;
  const innerHeight = window.innerHeight;
  // 更新渲染器大小
  renderer.setSize(innerWidth, innerHeight);
  // 更新摄像头宽高比
  camera.aspect = innerWidth / innerHeight;
  // 更新摄像头投影矩阵
  camera.updateProjectionMatrix();
});

onMounted(() => {
  createControls();
  render();
});
</script>

<style scope>
.container {
  width: 100vw;
  height: 100vh;
  background-color: #f0f0f0;
}
</style>