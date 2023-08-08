<!-- 22.多个物体联合包围盒 -->
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
camera.position.set(1, 2, 10);
scene.add(camera);

// 22.1 创建多个物体【14.1 创建球】
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
// 22.2 实例化包围盒
let box = new THREE.Box3();
// 22.3 需要联合创建包围盒的物体
const sphereArr = [sphere1, sphere2, sphere3];
sphereArr.forEach(sphere => {
  /*
  // 22.4 计算当前物体包围盒
  sphere.geometry.computeBoundingBox();
  // 22.5 获取物体包围盒
  const box3 = sphere.geometry.boundingBox;
  // 22.6 更新世界矩阵
  sphere.updateWorldMatrix(true, true);
  // 22.7 将包围盒转换到世界坐标系
  box3.applyMatrix4(sphere.matrixWorld);
  */
  // 22.10 第二种方式
  const box3 = new THREE.Box3().setFromObject(sphere);
  // 22.8 合并包围球
  box.union(box3);
});
// 22.9 创建包围盒辅助器
const boxHelper = new THREE.Box3Helper(box, 0xffff00);
scene.add(boxHelper);

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