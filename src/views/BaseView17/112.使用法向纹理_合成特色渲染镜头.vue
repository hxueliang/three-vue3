<!-- 112.使用法向纹理_合成特色渲染镜头 -->
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

// 109.1 导入效果合成器
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
// 109.1 导入three自带的效果
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';


let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 300);
camera.position.set(0, 0, 5);
scene.add(camera);

const gui = new GUI();

// 106.0 添加环境纹理
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

// 106.0 添加平行光
const directionLight = new THREE.DirectionalLight("#ffffff", 1);
directionLight.position.set(0, 0, 200);
scene.add(directionLight);

// 106.0 加载模型
const gltfLoader = new GLTFLoader();
gltfLoader.load("./model/DamagedHelmet/glTF/DamagedHelmet.gltf", (gltf) => {
  const mesh = gltf.scene.children[0];
  scene.add(mesh);
});

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(innerWidth, innerHeight);
// 106.4.1 开启阴影投敌
renderer.shadowMap.enabled = true;

// 109.2 实例化效果合成器
const effectComposer = new EffectComposer(renderer);
effectComposer.setSize(innerWidth, innerHeight);

// 109.4 添加渲染通道，效果与原渲染效果一样
const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);


// 110.3.1 发光效果
const unrealBloomPass = new UnrealBloomPass();
effectComposer.addPass(unrealBloomPass);
// 110.3.2 gui调试
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
unrealBloomPass.strength = 1;
unrealBloomPass.radius = 0;
unrealBloomPass.threshold = 1;
gui.add(renderer, 'toneMappingExposure').min(0).max(2).step(0.01);
gui.add(unrealBloomPass, 'strength').min(0).max(2).step(0.01);
gui.add(unrealBloomPass, 'radius').min(0).max(2).step(0.01);
gui.add(unrealBloomPass, 'threshold').min(0).max(2).step(0.01);

// 111.3 着色器渲染通道 纹理 rgb
const shaderPass = new ShaderPass({
  uniforms: {
    tDiffuse: {
      value: null
    },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;

    // 111.4.1 接收纹理，这是shader默认传
    uniform sampler2D tDiffuse;

    void main() {
      // 111.4.2 取色，通过uv根据纹理
      vec4 color = texture2D(tDiffuse, vUv);

      gl_FragColor = color;
    }
  `,
});
effectComposer.addPass(shaderPass);


// 112.1 加载法向纹理
const textureLoader = new THREE.TextureLoader();
const normalTexture = textureLoader.load('./big/interfaceNormalMap.png');

// 112.2 创建着色器渲染通道
const techPass = new ShaderPass({
  uniforms: {
    tDiffuse: {
      value: null
    },
    // 112.2.1 传参
    uNormalMap: {
      value: null
    },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;

    // 111.4.1 接收纹理
    uniform sampler2D tDiffuse;

    // 112.2.2 接参
    uniform sampler2D uNormalMap;

    void main() {
      // 111.4.2 取色，通过uv根据纹理
      vec4 color = texture2D(tDiffuse, vUv);

      // 112.2.3 用参
      // vec4 normalColor = texture2D(uNormalMap, vUv);
      // gl_FragColor = normalColor;


      // 112.3 合成特色镜头
      // 112.3.1 拿法向纹理
      vec4 normalColor = texture2D(uNormalMap, vUv);
      // 112.3.2 设置光线的角度，用normalize得到单位向量
      vec3 lightDirection = normalize(vec3(-5,5,2)) ;
      // 112.3.3 得到纹理和单位向量的点积
      float normalDotDirection = dot(normalColor.xyz, lightDirection);
      // 113.3.4 得到折射亮度(0~1之间的值，clamp大于1返回1，小于0返回0)
      float lightness = clamp(normalDotDirection, 0.0, 1.0);
      // 113.3.5 折射亮度加到color纹理
      color.rbg += lightness;
      gl_FragColor = color;
    }
  `,
});
// 112.2.4 设置参数值
techPass.material.uniforms.uNormalMap.value = normalTexture;
effectComposer.addPass(techPass);


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

  cantrols && cantrols.update();

  // renderer.render(scene, camera);

  // 109.3 使用合成效果render渲染
  effectComposer.render(scene, camera);

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