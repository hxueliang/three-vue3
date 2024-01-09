<!-- 30.Physical材质 -->
<!-- 30.物理材质 -->
<!-- MeshStandardMaterial的扩展，提供了更高级的基于物理的渲染属性 -->
<!-- Clearcoat: 有些类似于车漆，碳纤，被水打湿的表面的材质需要在面上再增加一个透明的，具有一定反光特性的面。而且这个面说不定有一定的起伏与粗糙度。Clearcoat可以在不需要重新创建一个透明的面的情况下做到类似的效果。 -->
<!-- 基于物理的透明度:.opacity属性有一些限制:在透明度比较高的时候，反射也随之减少。使用基于物理的透光性.transmission属性可以让一些很薄的透明表面，例如玻璃，变得更真实一些。 -->
<!-- 高级光线反射: 为非金属材质提供了更多更灵活的光线反射。 -->
<!-- Sheen: Can be used for representing cloth and fabric materials. -->
<!-- MeshPhysicalMaterial -->
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
import { TextureLoader } from 'three';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(1, 2, 3);
scene.add(camera);

// 28.1 加载环境贴图 【10.1 创建RGBELoader】
const rgbeLoader = new RGBELoader();
rgbeLoader.load('./texture/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  // 28.2.5 设置映射为折面映射
  envMap.mapping = THREE.EquirectangularRefractionMapping;
  scene.background = envMap;
  scene.environment = envMap;

  // 28.2 加载物体模型
  const gltfLoader = new GLTFLoader();
  gltfLoader.load('./model/Duck.glb', gltf => {
    scene.add(gltf.scene);
    // 28.2.4 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const duckMesh = gltf.scene.getObjectByName('LOD3spShape');
    const sourceMaterial = duckMesh.material;
    duckMesh.material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      // 28.2.6 设置原来的贴图
      map: sourceMaterial.map,
      // 28.2.1 折射率，不应超过1，默认值为0.98
      refractionRatio: 0.6,
      // 28.2.2 环境贴图对表面的影响程度，默认值为1，介于0（无反射）和1（完全反射）之间
      reflectivity: 0.99,
      // 28.2.3 设置环境贴图
      envMap: envMap,
    });
  });
});



// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
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