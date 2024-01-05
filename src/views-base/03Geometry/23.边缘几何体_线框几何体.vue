<!-- 23.边缘几何体_线框几何体 -->
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
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper';
import TheCar from '../../components/TheCar.vue';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(1, 2, 35);
scene.add(camera);

// 23.1 加载模型
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
const rgbeLoader = new RGBELoader();
dracoLoader.setDecoderPath('./draco/');
gltfLoader.setDRACOLoader(dracoLoader);
rgbeLoader.load('./texture/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = envMap;
  scene.environment = envMap;
});
gltfLoader.load('./model/building.glb', gltf => {
  // 23.7 隐藏原物体
  // scene.add(gltf.scene);
  const building = gltf.scene.children[0];
  const geometry = building.geometry;
  // 23.2.1 创建边缘几何体
  const edgesGeometry = new THREE.EdgesGeometry(geometry);
  // 23.2.2 创建线框几何体
  // const edgesGeometry = new THREE.WireframeGeometry(geometry);
  // 23.3 创建线段材质
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
  });
  // 23.4 创建线段
  const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  // 23.6 更新建筑世界转换矩阵
  building.updateWorldMatrix(true, true);
  edges.matrix.copy(building.matrixWorld);
  edges.matrix.decompose(edges.position, edges.quaternion, edges.scale);
  // 23.5 添加进场景
  scene.add(edges);
});

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