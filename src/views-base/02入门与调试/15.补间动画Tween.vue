<!-- 15.补间动画Tween -->
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
const sphere = createSphere(0x00ff00);
scene.add(sphere);

// 15.1 创建tween实例
const tween = new TWEEN.Tween(sphere.position);
// 15.2 设置动画
tween
  .to({ x: 4 }, 2000) // 设置移动终点，时间
  // .repeat(Infinity)
  // .yoyo(true)
  // .delay(500)
  .easing(TWEEN.Easing.Quadratic.InOut) // https://tweenjs.github.io/tween.js/examples/03_graphs.html
  .start()
  .onStart(_ => console.log('开始'))
  .onComplete(_ => console.log('结束'))
  // .onUpdate(_ => console.log('更新'))
  .onStop((_ => console.log('停止')));

// 15.4 设置第二个tween
const tween2 = new TWEEN.Tween(sphere.position);
tween2
  .to({ y: -4 }, 2000)
  .easing(TWEEN.Easing.Quadratic.InOut);
// 15.5 设置第一个补间动画完成后，接着进行第二次补间动画
tween.chain(tween2);
console.log(tween);
// 15.6 使用gui设置暂停/开始
const gui = new GUI();
const params = {
  stop() { tween.stop(); },
  start() { tween.start(); },
  pause() { tween.pause(); },
  resume() { tween.resume(); }
};
gui.add(params, 'stop');
gui.add(params, 'start');
gui.add(params, 'pause');
gui.add(params, 'resume');


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

  // 15.3 更新tween
  TWEEN.update(); // tween.update();
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