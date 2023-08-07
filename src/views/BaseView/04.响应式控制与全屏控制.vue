<!-- 4.响应式控制与全屏控制 -->
<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(5, 5, 10);
scene.add(camera);

// 1.3 创建物体
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const parentCubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

// 2.1 物体位移
cube.position.x = 2;
// 2.2 创建cube的父元素
const parentCube = new THREE.Mesh(cubeGeometry, parentCubeMaterial);
parentCube.add(cube);
parentCube.position.x = -2;

// 3.1 物体缩放
cube.scale.set(2, 2, 2);
// 3.2 父元素缩放
parentCube.scale.set(2, 2, 2);

// 3.3 物体旋转
cube.rotation.x = Math.PI / 4;
// 3.4 父元素旋转
parentCube.rotation.x = Math.PI / 4;

scene.add(parentCube);

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

// 4.2 监听双击事件，实现全屏切换
window.addEventListener('dblclick', () => {
  if (!document.fullscreenElement) {
    renderer.domElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
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