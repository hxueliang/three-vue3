<!-- 18.顶点操作_位移_旋转_缩放 -->
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

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(1, 2, 15);
scene.add(camera);


// 17.1 添加环境贴图【10.1 创建RGBELoader】
const rgbeLoader = new RGBELoader();
// 10.2 加载hdr图
rgbeLoader.load('./texture/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  // 10.3 设置球形映射
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  // 10.4 给场景设置背景
  scene.background = envMap;
  // 10.5 给场景设置环境贴图
  scene.environment = envMap;
  // 10.5 给planeMaterial设置环境贴图
  planeMaterial.envMap = envMap;
  // 17.3 给material设置环境贴图
  material.envMap = envMap;
});

// 16.2 加载uv纹理
const uvTexture = new THREE.TextureLoader().load('./texture/uv_grid_opengl.jpg');
// 16.1 创建平面
const planeGeometry = new THREE.PlaneGeometry(2, 2);
const planeMaterial = new THREE.MeshBasicMaterial({ map: uvTexture });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.position.x = -2;
scene.add(plane);
// 16.3 手动创建手几何体
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
  -1, -1, 0, // 一个几何体顶点三个坐标
  1, -1, 0,
  1, 1, 0,
  -1, 1, 0
]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3)); // 三个一组
const indices = new Uint16Array([0, 1, 2, 2, 3, 0]);
geometry.setIndex(new THREE.BufferAttribute(indices, 1));
// 16.3.1 设置uv坐标
const uv = new Float32Array([
  0, 0, // 一个uv顶点二个坐标
  1, 0,
  1, 1,
  0, 1
]);
// 16.3.2 创建uv属性
geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); // 二个一组
// 17.2.1 自动计算出法向量
// geometry.computeVertexNormals();
// 17.2.2 手动设置法向量
const normals = new Float32Array([
  0, 0, 1,
  0, 0, 1,
  0, 0, 1,
  0, 0, 1
]);
geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
// 18.1 移动顶点（修改：Mesh.geometry.attributes.position.x）// 对比移动物体（修改：Mesh.position.x）
geometry.translate(4, 0, 0);
// 18.2 旋转（修改：Mesh.geometry.attributes.position.y）// 对比旋转物体（修改：Mesh.rotation.x）
// geometry.rotateX(Math.PI / 2);
// 18.3 缩放（修改：Mesh.geometry.attributes.position.x）// 对比缩放物体（修改：Mesh.scale.x）
// geometry.scale(3, 1, 1);
// 总结：
// 1.对顶点的操作直接修改顶点数据，不如直接对物体操作修改物体的属性直观。
// 2.所以大部分情况都使用对物体操作，不使用对顶点操作
// 3.除非后端返回的顶点数据不便于使用，才会使用对顶点操作，使用顶点回到好操作的位置，再使用对物体操作
const material = new THREE.MeshBasicMaterial({ map: uvTexture });
const cube = new THREE.Mesh(geometry, material);
// cube.position.x = 2;
// cube.rotation.x = Math.PI / 2;
// cube.scale.x = 3;
// 17.3 创建法向量辅助器
const helper = new VertexNormalsHelper(cube, 0.5, 0xff0000);
scene.add(helper);
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