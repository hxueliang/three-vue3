<!-- 14.光线投射实现场景交互 -->
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
camera.position.set(1, 2, 15);
scene.add(camera);

// 14.1 创建球
function createSphere(color) {
  return (new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshBasicMaterial({
      color
    })
  ));
}
const sphere1 = createSphere(0x00ff00);
const sphere2 = createSphere(0x0000ff);
const sphere3 = createSphere(0xff00ff);
sphere1.position.x = -4;
sphere2.position.x = 0;
sphere3.position.x = 4;
scene.add(sphere1);
scene.add(sphere2);
scene.add(sphere3);
// 14.2 创建射线
const raycaster = new THREE.Raycaster();
// 14.3 创建鼠标向量，用来保存鼠标点在画面哪里
const mouse = new THREE.Vector2();
// 14.4 监听点击事件
document.addEventListener('click', event => {
  // 14.4.1 设置鼠标向量经x,y的值
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // console.log(mouse.x, mouse.y);
  // 14.4.2 通过摄像机和鼠标位置更新射线
  raycaster.setFromCamera(mouse, camera);
  // 14.4.3 检测射线有没与物体相交
  const intersects = raycaster.intersectObjects([sphere1, sphere2, sphere3]);
  // 14.4.4 如果有相交的物体，取最近的一个，改变其颜色
  if (intersects.length > 0) {
    const [firstSphere] = intersects;
    if (firstSphere.object._isSelect) {
      firstSphere.object.material.color.set(firstSphere.object._originColor);
    } else {
      firstSphere.object._originColor = firstSphere.object.material.color.getHex();
      firstSphere.object.material.color.set(0xff0000);
    }
    firstSphere.object._isSelect = !firstSphere.object._isSelect;
  }
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