<!-- 50.多个透明物体混合_杯子_液体_冰块 -->
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
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader';
import { LogLuvLoader } from 'three/examples/jsm/loaders/LogLuvLoader';
import { RGBMLoader } from 'three/examples/jsm/loaders/RGBMLoader';
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(1, 2, 5);
scene.add(camera);

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);

// 10.1 创建RGBELoader
const rgbeLoader = new RGBELoader();
// 10.2 加载hdr图
rgbeLoader.load('./texture/Alex_Hart-Nature_Lab_Bones_2k.hdr', envMap => {
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = envMap;
  scene.environment = envMap;
});

const gui = new GUI();

// 50.6 gui调试
function createGui(mesh, name) {
  const folder = gui.addFolder(name);
  folder.add(mesh.material, "blendEquation", {
    AddEquation: THREE.AddEquation,
    SubtractEquation: THREE.SubtractEquation,
    ReverseSubtractEquation: THREE.ReverseSubtractEquation,
    MinEquation: THREE.MinEquation,
    MaxEquation: THREE.MaxEquation,
  });
  folder.add(mesh.material, "blendSrc", {
    ZeroFactor: THREE.ZeroFactor,
    OneFactor: THREE.OneFactor,
    SrcColorFactor: THREE.SrcColorFactor,
    OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
    SrcAlphaFactor: THREE.SrcAlphaFactor,
    OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
    DstAlphaFactor: THREE.DstAlphaFactor,
    OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
    DstColorFactor: THREE.DstColorFactor,
    OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
    SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
  });
  folder.add(mesh.material, "blendDst", {
    ZeroFactor: THREE.ZeroFactor,
    OneFactor: THREE.OneFactor,
    SrcColorFactor: THREE.SrcColorFactor,
    OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
    SrcAlphaFactor: THREE.SrcAlphaFactor,
    OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
    DstAlphaFactor: THREE.DstAlphaFactor,
    OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
    DstColorFactor: THREE.DstColorFactor,
    OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
    // SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
  });
  folder.add(mesh.material, "blendEquationAlpha", {
    AddEquation: THREE.AddEquation,
    SubtractEquation: THREE.SubtractEquation,
    ReverseSubtractEquation: THREE.ReverseSubtractEquation,
    MinEquation: THREE.MinEquation,
    MaxEquation: THREE.MaxEquation,
  });
  folder.add(mesh.material, "blendSrcAlpha", {
    ZeroFactor: THREE.ZeroFactor,
    OneFactor: THREE.OneFactor,
    SrcColorFactor: THREE.SrcColorFactor,
    OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
    SrcAlphaFactor: THREE.SrcAlphaFactor,
    OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
    DstAlphaFactor: THREE.DstAlphaFactor,
    OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
    DstColorFactor: THREE.DstColorFactor,
    OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
    SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
  });
  folder.add(mesh.material, "blendDstAlpha", {
    ZeroFactor: THREE.ZeroFactor,
    OneFactor: THREE.OneFactor,
    SrcColorFactor: THREE.SrcColorFactor,
    OneMinusSrcColorFactor: THREE.OneMinusSrcColorFactor,
    SrcAlphaFactor: THREE.SrcAlphaFactor,
    OneMinusSrcAlphaFactor: THREE.OneMinusSrcAlphaFactor,
    DstAlphaFactor: THREE.DstAlphaFactor,
    OneMinusDstAlphaFactor: THREE.OneMinusDstAlphaFactor,
    DstColorFactor: THREE.DstColorFactor,
    OneMinusDstColorFactor: THREE.OneMinusDstColorFactor,
    // SrcAlphaSaturateFactor: THREE.SrcAlphaSaturateFactor,
  });
}

// 50.1 加载物体
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('./draco/');
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load(
  './model/cup.glb',
  gltf => {
    console.log(gltf);
    const cup = gltf.scene.getObjectByName('copo_low_01_vidro_0');
    const water = gltf.scene.getObjectByName('copo_low_02_agua_0');
    const ice = gltf.scene.getObjectByName('copo_low_04_vidro_0');
    // console.log(cup, water, ice);

    // 50.2 模型不做好，微调一下
    ice.scale.set(0.86, 0.86, 0.86);
    water.position.z = -1;

    // 50.3 设置渲染顺序，从里到外
    ice.renderOrder = 1;
    water.renderOrder = 2;
    cup.renderOrder = 3;

    // 50.4 隐藏杯子，液体，调试冰块
    // cup.visible = false;
    // water.visible = false;

    // 50.5 给冰块设置透明度
    const srcIceMaterial = ice.material;
    ice.material = new THREE.MeshPhysicalMaterial({
      normalMap: srcIceMaterial.normalMap,
      metalnessMap: srcIceMaterial.metalnessMap,
      roughness: 0.05,
      color: 0xffffff,
      transmission: 0.95,
      transparent: true,
      thickness: 20,
      ior: 2
    });

    // 50.5 给水设置透明度
    const srcWaterMaterial = water.material;
    water.material = new THREE.MeshPhysicalMaterial({
      map: srcWaterMaterial.map,
      normalMap: srcWaterMaterial.normalMap,
      metalnessMap: srcWaterMaterial.metalnessMap,
      roughnessMap: srcWaterMaterial.roughnessMap,
      roughness: 0.1,
      transmission: 0.95,
      transparent: true,
      thickness: 10,
      ior: 2,
      // opacity: 0.6,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.SrcColorFactor,
    });

    // 50.5 给杯设置透明度
    const srcCupMaterial = cup.material;
    cup.material = new THREE.MeshPhysicalMaterial({
      map: srcWaterMaterial.map,
      normalMap: srcCupMaterial.normalMap,
      metalnessMap: srcCupMaterial.metalnessMap,
      roughnessMap: srcCupMaterial.roughnessMap,
      roughness: 0.3,
      transmission: 0.95,
      transparent: true,
      thickness: 10,
      ior: 2,
      // opacity: 0.6,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.SrcColorFactor,
    });

    createGui(water, '水');
    createGui(cup, '杯');

    scene.add(gltf.scene);
  }
);

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