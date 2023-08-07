<!-- 7.不同的面设置不同材质 -->
<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(2, 5, 10);
scene.add(camera);

// 6.1 创建几何体
const geometry = new THREE.BufferGeometry();
// 6.4 创建顶点数据，使用索引共用重合顶点，只需4个顶点
const vertices = new Float32Array([
  -1, -1, 1,
  1, -1, 1,
  1, 1, 1,
  -1, 1, 1
]);
// 6.5 创建顶点属性
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
// 6.6 创建索引
const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
// 7.1 设2个顶点组，形成2个材质
geometry.addGroup(0, 3, 0); // 索引0开始，3个一组，下标为0的材质
geometry.addGroup(3, 3, 1); // 索引3开始，3个一组，下标为1的材质
// 6.7 创建索引属性
geometry.setIndex(new THREE.BufferAttribute(indices, 1));
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
});
const material1 = new THREE.MeshBasicMaterial({
  color: 0xff0000,
});
const cube = new THREE.Mesh(geometry, [material, material1]); // 材质传数组
scene.add(cube);

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