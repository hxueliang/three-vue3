<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// 导入水面
import { Water } from 'three/examples/jsm/objects/Water2';
// 导入gltf载入库
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// 导入解压库
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
// 导入rgbeLoader用来加载hdr图
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';


const { innerWidth, innerHeight } = window;
const container = ref(null);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 2000);
camera.position.set(-50, 50, 130);
camera.aspect = innerWidth / innerHeight;
camera.updateProjectionMatrix();
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  // 设置抗锯齿
  antialias: true,
  // 对数深度缓冲区
  logarithmicDepthBuffer: true,
});
// 设置渲染输出编码
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(innerWidth, innerHeight);

// 添加平面
// const planeGeometry = new THREE.PlaneGeometry(100, 100);
// const planeMetarial = new THREE.MeshBasicMaterial({
//   color: 0xffffff,
// });
// const plane = new THREE.Mesh(planeGeometry, planeMetarial);
// scene.add(plane);

// 创建一个巨大的球
const skyGeometry = new THREE.SphereGeometry(1000, 60, 60);
const skyTuxture = new THREE.TextureLoader().load('./imgs/sky/sky.jpg');
const skyMetarial = new THREE.MeshBasicMaterial({
  map: skyTuxture
});
skyGeometry.scale(1, 1, -1);
const sky = new THREE.Mesh(skyGeometry, skyMetarial);
scene.add(sky);

// 创建视频纹理
const video = document.createElement('video');
video.src = './imgs/sky/sky.mp4';
video.loop = true;
window.addEventListener('click', e => {
  if (video.paused) {
    video.play();
    const videoTexture = new THREE.VideoTexture(video);
    skyMetarial.map = videoTexture;
    skyMetarial.map.needsUpdate = true;

    scene.background = skyTuxture;
    scene.environment = skyTuxture;
  }
});

// 载入hdr类型的环境纹理
const hdrLoader = new RGBELoader();
hdrLoader.loadAsync('./hdr/island.hdr').then(texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

// 添加平行光
const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(-100, 100, 10);
scene.add(light);

// 创建一个圆形平面：水面
const waterGeometry = new THREE.CircleGeometry(300, 64);
const water = new Water(waterGeometry, {
  textureWidth: 1024,
  textureHeight: 1024,
  color: 0xeeeeff,
  flowDirection: new THREE.Vector2(1, 1),
  scale: 1,
});
water.position.y = 3;
water.rotation.x = -Math.PI / 2;
scene.add(water);

// 添加小岛模型
// 实例化gltf载入库
const loader = new GLTFLoader();
// 实例化draco载入库
const dracoLoader = new DRACOLoader();
// 添加draco载入库存 （/node_modules/three/examples/jsm/libs/draco）
dracoLoader.setDecoderPath('./draco/');
// 把loader、dracoLoader结合在一起
loader.setDRACOLoader(dracoLoader);
// 加载模型
loader.load('./model/island2.glb', gltf => {
  scene.add(gltf.scene);
});

// 监听视口变化
window.addEventListener('resize', () => {
  const innerWidth = window.innerWidth;
  const innerHeight = window.innerHeight;
  // 更新摄像头宽高比
  camera.aspect = innerWidth / innerHeight;
  // 更新摄像头投影矩阵
  camera.updateProjectionMatrix();

  // 更新渲染器大小
  renderer.setSize(innerWidth, innerHeight);
  // 更新渲染器像数比
  renderer.setPixelRatio(window.devicePixelRatio);
});

let caontrols = null;
function render() {
  caontrols.update();

  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

onMounted(() => {
  caontrols = new OrbitControls(camera, container.value);
  caontrols.enableDamping = true;

  container.value.appendChild(renderer.domElement);
  render();
});
</script>