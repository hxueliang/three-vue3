<!-- 108.js传参给shader_人物动起来 -->
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

import vertexShader from "../../shader/flylight/vertex.glsl?raw";
import fragmentShader from '../../shader/flylight/fragment.glsl?raw';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 300);
camera.position.set(0, 0, 20);
scene.add(camera);

const gui = new GUI();

// 105.0.1 添加环境纹理
const cubeTextureLoader = new THREE.CubeTextureLoader();
const envMapTexture = cubeTextureLoader.load([
  "textures/environmentMaps/0/px.jpg",
  "textures/environmentMaps/0/nx.jpg",
  "textures/environmentMaps/0/py.jpg",
  "textures/environmentMaps/0/ny.jpg",
  "textures/environmentMaps/0/pz.jpg",
  "textures/environmentMaps/0/nz.jpg",
]);
scene.environment = envMapTexture;
scene.background = envMapTexture;

// 105.0.2 添加环境光
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
// scene.add(ambientLight);
// const pointLight = new THREE.PointLight(0xffffff, 0.5);
// pointLight.position.set(2, 3, 4);
// scene.add(pointLight);

// 105.0.3 添加平行光
const directionLight = new THREE.DirectionalLight("#ffffff", 1);
// 106.4.2 开启阴影投敌
directionLight.castShadow = true;
directionLight.position.set(0, 0, 200);
scene.add(directionLight);

// 105.1 创建材质，加载模型纹理和模型的法向纹理
const textureLoader = new THREE.TextureLoader();
const mapTexture = textureLoader.load("./model/LeePerrySmith/color.jpg");
const normalTexture = textureLoader.load("./model/LeePerrySmith/normal.jpg");
const material = new THREE.MeshStandardMaterial({
  map: mapTexture,
  normalMap: normalTexture,
});

// 108.1.1 设置参数对象
const customUniforms = {
  uTime: {
    value: 0
  }
};

// 106.1 设置材质编译shader前回调
material.onBeforeCompile = (shader, renderer) => {
  console.log(shader.vertexShader);
  console.log(shader.fragmentShader);
  // 108.1.2 传参1
  shader.uniforms.uTime = customUniforms.uTime;
  shader.vertexShader = shader.vertexShader.replace(
    `#include <common>`,
    `
    #include <common>

    // 106.3 设置旋转矩阵
    mat2 rotate2d(float _angle){
      return mat2(
        cos(_angle), -sin(_angle),
        sin(_angle), cos(_angle)
      );
    }

    // 108.1.3 接参1（声明变量）
    uniform float uTime;
    `,
  );

  shader.vertexShader = shader.vertexShader.replace(
    `#include <beginnormal_vertex>`,
    `
    #include <beginnormal_vertex>

    // 107.1 让法向旋转，效果人物光线与阴影
    // float angle = position.y * 0.5; // 跟据y坐标设置旋转角度
    // 108.1.4 用参1
    float angle = sin(position.y + uTime) * 0.5;
    mat2 rotateMatrix = rotate2d(angle);
    objectNormal.xz = rotateMatrix * objectNormal.xz;
    `,
  );

  shader.vertexShader = shader.vertexShader.replace(
    `#include <begin_vertex>`,
    `
    #include <begin_vertex>

    // 106.2 让头顶点旋转
    // float angle = transformed.y * 0.5; // 跟据y坐标设置旋转角度
    // mat2 rotateMatrix = rotate2d(angle);
    transformed.xz = rotateMatrix * transformed.xz;
    `,
  );
};

// 107.2.2 创建自定义深度材质
const depthMaterial = new THREE.MeshDepthMaterial({
  depthPacking: THREE.RGBADepthPacking
});

// 107.2.3 设置自定义材质编译shader前回调
depthMaterial.onBeforeCompile = (shader, renderer) => {

  // 108.1.5 传参2
  shader.uniforms.uTime = customUniforms.uTime;
  shader.vertexShader = shader.vertexShader.replace(
    `#include <common>`,
    `
    #include <common>

    mat2 rotate2d(float _angle){
      return mat2(
        cos(_angle), -sin(_angle),
        sin(_angle), cos(_angle)
      );
    }

    // 108.1.6 接参2（声明变量）
    uniform float uTime;
    `,
  );
  shader.vertexShader = shader.vertexShader.replace(
    `#include <begin_vertex>`,
    `
    #include <begin_vertex>

    // float angle = transformed.y * 0.5; // 跟据y坐标设置旋转角度
    // 108.1.7 用参2
    float angle = sin(position.y + uTime) * 0.5;
    mat2 rotateMatrix = rotate2d(angle);
    transformed.xz = rotateMatrix * transformed.xz;
    `,
  );
};

// 105.0.4 加载模型
const gltfLoader = new GLTFLoader();
gltfLoader.load("./model/LeePerrySmith/LeePerrySmith.glb", (gltf) => {
  const mesh = gltf.scene.children[0];

  // 105.2 替换材质
  mesh.material = material;

  // 106.4.3 开启阴影投敌
  mesh.castShadow = true;

  // 107.2.1 设置自定义深度材质
  mesh.customDepthMaterial = depthMaterial;

  scene.add(mesh);
});

// 105.0.5 添加平面
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial()
);
plane.position.set(0, 0, -6);
// 106.4.4 开启接收阴影投敌
plane.receiveShadow = true;
scene.add(plane);

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(innerWidth, innerHeight);
// 106.4.1 开启阴影投敌
renderer.shadowMap.enabled = true;

// 1.6 创建控制器
let cantrols = null;
function createControls() {
  cantrols = new OrbitControls(camera, container.value);
  cantrols.enableDamping = true;
  cantrols.dampingFactor = 0.05;
}

// 1.7 添加坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// 设置时钟
const clock = new THREE.Clock();

// 1.5 创建渲染函数
function render() {
  const elapsedTime = clock.getElapsedTime();

  // 108.1.8 改参
  customUniforms.uTime.value = elapsedTime;

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
  container.value.appendChild(renderer.domElement);
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