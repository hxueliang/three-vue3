<!-- 69.页面样式_第一个页面 -->
<template>
  <!-- 69.0.1 添加三个页面 -->
  <div class="page page1">
    <h1>THREE.Raycaster</h1>
    <h3>实现3d交互</h3>
  </div>
  <div class="page page2">
    <h1>THREE.BufferGeometry</h1>
    <h3>打造酷炫三角形</h3>
  </div>
  <div class="page page3">
    <h1>点光源</h1>
    <h3>围绕照亮小球</h3>
  </div>

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
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import { LogLuvLoader } from 'three/examples/jsm/loaders/LogLuvLoader';
import { RGBMLoader } from 'three/examples/jsm/loaders/RGBMLoader';
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';
import gsap from 'gsap';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 300);
camera.position.set(0, 3, 18);
scene.add(camera);

// 69.1.1 渲染器允许透明【1.4 创建渲染器】
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(innerWidth, innerHeight);

// 69.1.3 修改立方体大小 【68.1 创建物体】
const geometry = new THREE.BoxGeometry(1.1, 1.1, 1.1);
const material = new THREE.MeshBasicMaterial({
  wireframe: true
});
const redMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
});
const cubeArr = [];
// 69.2.1 创建组
const cubeGroup = new THREE.Group();
// 69.1.4 修改立方体大小
for (let x = 0; x < 5; x++) {
  for (let y = 0; y < 5; y++) {
    for (let z = 0; z < 5; z++) {
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(x * 2 - 4, y * 2 - 4, z * 2 - 4);
      // 69.2.2 物体添加进组
      cubeGroup.add(cube);
      cubeArr.push(cube);
    }
  }
}
// 69.2.3 组添加进场景
scene.add(cubeGroup);
// 68.2 创建投射光线
const raycaster = new THREE.Raycaster();
// 68.3 创建鼠标位置
const mouse = new THREE.Vector2();
// 68.4 监听鼠标点击事件
window.addEventListener('click', event => {
  mouse.x = event.clientX / window.innerWidth * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight * 2 - 1);
  raycaster.setFromCamera(mouse, camera);
  let result = raycaster.intersectObjects(cubeArr);
  // 68.5.1 把最前面的设置为red
  // result[0].object.material = redMaterial;
  // 68.5.2 把射线穿过的设置为red
  result.forEach(res => res.object.material = redMaterial);
});

const gui = new GUI();

// 1.6 创建控制器
let cantrols = null;
function createControls() {
  cantrols = new OrbitControls(camera, container.value);
  cantrols.enableDamping = true;
  cantrols.dampingFactor = 0.05; // 阻尼：值越大惯性越小，0不能动

}

// 1.7 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 设置时钟
const clock = new THREE.Clock();

// 1.5 创建渲染函数
function render() {
  const time = clock.getElapsedTime();

  // 69.2.4 设置级旋转
  cubeGroup.rotation.x = time * 0.5;
  cubeGroup.rotation.y = time * 0.5;

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
  // 69.1.2 关闭控制器，因为这个项目需要滚动事件
  // createControls();

  container.value.appendChild(renderer.domElement);
  render();
});
</script>

<style lang="less" scope>
.container {
  width: 100vw;
  height: 100vh;
  // 69.0.3 
  // background-color: #f0f0f0;
  position: fixed;
  left: 0;
  top: 0;
}

// 69.0.2 设置样式
.page {
  background-color: #101a35;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  overflow: hidden;

  h1 {
    margin: 60px;
    font-size: 40px;
  }

  h3 {
    font-size: 30px;
  }
}
</style>