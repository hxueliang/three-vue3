<!-- 08判断两个点是否在线段同一侧 -->
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
import { DoubleSide } from 'three';

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
  createCamera(5, 15, 30);
  createRenderer();
  createAxes();
  // createAmbientTexture();
  createAmbientLight();
  createDirLight();
  // createPointLight();
  // createSpotLight();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  // 已知条件
  // 一条线段两点坐标A、B
  const A = new THREE.Vector3(0, 0, 1);
  const B = new THREE.Vector3(5, 0, 1);

  // 判断p1、p2两点位于线段AB同一侧，还是异侧
  const p1 = new THREE.Vector3(2, 0, 4);
  // const p2 = new THREE.Vector3(8, 0, 4); // 与p1同侧
  const p2 = new THREE.Vector3(8, 0, -4); // 与p1异侧

  // 小球可视化四个坐标点
  const group = new THREE.Group();
  scene.add(group);
  const R = 0.2;
  const AMesh = createSphereMesh(0xffff00, R);
  AMesh.position.copy(A);
  const BMesh = createSphereMesh(0xffff00, R);
  BMesh.position.copy(B);
  const p1Mesh = createSphereMesh(0xff0000, R);
  p1Mesh.position.copy(p1);
  const p2Mesh = createSphereMesh(0xff0000, R);
  p2Mesh.position.copy(p2);
  group.add(AMesh, BMesh, p1Mesh, p2Mesh);

  // Line可视化线段AB
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    A.x, A.y, A.z,
    B.x, B.y, B.z,
  ]);
  geometry.attributes.position = new THREE.BufferAttribute(vertices, 3);
  const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
  const line = new THREE.LineLoop(geometry, material);
  group.add(line);

  /**
   * p1分别向线段AB两点创建两条向量a1、b1
   * p2分别向线段AB两点创建两条向量a2、b2
   * 你会发现，p1、p2同侧时候，a1转向b1与a2转向b2方向一致，如果是异侧，方向不一致。
   * 换句话说，a1叉乘b1得到向量c1，与a2叉乘b2得到向量c2，如果p1、p2同侧，那么c1和c2方向一样，否则方向不同。
   */

  // p1分别向线段AB两点创建两条向量a1、b1
  const a1 = A.clone().sub(p1);
  const b1 = B.clone().sub(p1);
  // p2分别向线段AB两点创建两条向量a2、b2
  const a2 = A.clone().sub(p2);
  const b2 = B.clone().sub(p2);

  // 通过c1、c2方向是否相同来推断两点是否位于线段同一侧
  const c1 = a1.clone().cross(b1);
  const c2 = a2.clone().cross(b2);

  // 可视化所有向量，辅助判断
  group.add(new THREE.ArrowHelper(a1.clone().normalize(), p1, a1.length(), 0xff0000));
  group.add(new THREE.ArrowHelper(b1.clone().normalize(), p1, b1.length(), 0x00ff00));
  group.add(new THREE.ArrowHelper(a2.clone().normalize(), p2, a2.length(), 0xff0000));
  group.add(new THREE.ArrowHelper(b2.clone().normalize(), p2, b2.length(), 0x00ff00));
  group.add(new THREE.ArrowHelper(c1.clone().normalize(), p1, 5, 0x0000ff));
  group.add(new THREE.ArrowHelper(c2.clone().normalize(), p2, 5, 0x0000ff));

  // 向量c1与c2夹角余弦值：用来推断向量c1与c2方向是否相同
  const cos = c1.normalize().dot(c2.normalize());
  if (cos > 0) { // 方向相同时候，余弦值1>0
    console.log('方向相同，两点在线段同侧');
  } else { // 方向相反时候，余弦值-1<0
    console.log('方向相反，两点在线段异侧');
  }
}

function createSphereMesh(color, R) {
  const geometry = new THREE.SphereGeometry(R);
  const material = new THREE.MeshBasicMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  return mesh;
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