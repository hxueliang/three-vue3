<!-- 45.纹理文件类型_KTX2_DDS_TGA -->
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
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader';
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader';
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0.5, 0.5, 3);
scene.add(camera);

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);

// 45.1 普通图版加载器
// const textureLoader = new THREE.TextureLoader();
// const texture = textureLoader.load('./texture/brick/brick_diffuse.jpg');

// 45.2 加载KTX2纹理
// 45.2.1 实例化KTX2加载器
// const ktx2Loader = new KTX2Loader()
//   .setTranscoderPath('./basis/') // node_modules/three/examples/jsm/libs/basis
//   .detectSupport(renderer);
// const texture = ktx2Loader.load(
//   './texture/opt/ktx2/Alex_Hart-Nature_Lab_Bones_2k_uastc_flipY_nomipmap.ktx2',
//   // './texture/opt/ktx2/Alex_Hart-Nature_Lab_Bones_2k_uastc-mip-triangle.ktx2',
//   texture => {
//     texture.mapping = THREE.EquirectangularReflectionMapping; // 如果要设置全景贴，导入的纹理就不分有mipmap
//     texture.anisotropy = 16;
//     texture.flipY = true; // 没生效?所以加载设置flipY的ktx2图片
//     scene.background = texture;
//     plane.material.map = texture;
//   }
// );

// 45.3 加载dds纹理
// const ddsLoader = new DDSLoader();
// const texture = ddsLoader.load(
//   './texture/opt/env/Alex_Hart-Nature_Lab_Bones_2k_bc3_nomip.dds',
//   texture => {
//     texture.mapping = THREE.EquirectangularReflectionMapping;
//     texture.flipY = true; // 不生效
//     texture.needsUpdate = true;
//     scene.background = texture;
//     scene.environment = texture;
//     plane.material.map = texture;
//   }
// );

// 45.4 加载tga纹理
const tgaLoader = new TGALoader();
const texture = tgaLoader.load(
  './texture/opt/env/Alex_Hart-Nature_Lab_Bones_2k-mipmap.tga',
  texture => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.flipY = true; // 生效
    scene.background = texture;
    scene.environment = texture;
    plane.material.map = texture;
  }
);

// 40.1 添加物体
texture.colorSpace = THREE.SRGBColorSpace;
const planeGeometry = new THREE.PlaneGeometry(2, 2);
const PlaneMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  map: texture,
  transparent: true,
});
const plane = new THREE.Mesh(planeGeometry, PlaneMaterial);
scene.add(plane);

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