<!-- 78.物理世界关联材质_摩擦与弹性系数 -->
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


let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 300);
camera.position.set(1, 3, 10);
scene.add(camera);

const gui = new GUI();

// 75.1.1 创建球体
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial();
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
// 75.2.3 开启投射阴影
sphere.castShadow = true;
scene.add(sphere);
// 75.1.2 创建平面
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.MeshStandardMaterial()
);
floor.position.y = -5;
floor.rotation.x = -Math.PI / 2;
// 75.2.4 设置接收阴影
floor.receiveShadow = true;
scene.add(floor);
// 75.1.3 设置灯光
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
// 75.2.1 开启灯光投射阴影
dirLight.castShadow = true;
scene.add(ambientLight);
scene.add(dirLight);

// 75.3 创建物理世界
const world = new CANNON.World();
world.gravity.set(0, -9.8, 0);
// 75.4 创建小球形状
const sphereShape = new CANNON.Sphere(1);
// 75.5 创建物理世界的物体
const sphereBody = new CANNON.Body({
  // 75.5.1 形状
  shape: sphereShape,
  // 75.5.2 位置
  position: new CANNON.Vec3(0, 0, 0),
  // 75.5.3 重量
  mass: 1,
  // 78.1.1 设置小球材质【75.5.4 材质】
  material: new CANNON.Material('sphere'),
});
// 75.6 将物体添加到世界
world.addBody(sphereBody);

// 77.3.1 导入音效
const hitSound = new Audio('./audio/metalHit.mp3');

// 77.1 监听碰撞事件
sphereBody.addEventListener('collide', e => {
  // 77.2 获取碰撞强度
  const impactStrength = e.contact.getImpactVelocityAlongNormal();
  // 77.3.2 播放，需要用户与页面有交互才能听到声音，测试的时候，可以点击一下页面会听到声音
  if (impactStrength > 2) {
    // 78.4 音效的时长，大于回弹的时长时，可以设置从0开始播放
    hitSound.currentTime = 0;
    hitSound.play();
  }
  console.log(impactStrength);
});

// 76.1 创建物理世界的地面
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body();
// 78.1.2 设置地面材质
floorBody.material = new CANNON.Material('floor');
// 76.1.1 当质量为0的时候，可以使用物体保持不动
floorBody.mass = 0;
// 76.1.2 设置形状
floorBody.addShape(floorShape);
// 76.1.3 设置位置
floorBody.position.set(0, -5, 0);
// 76.1.4 旋转地面的位置(参数为一个向量，物体将其旋转)
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
// 76.2 将地面添加到世界
world.addBody(floorBody);

// 78.2 设置2种材质的碰撞参数
const defaultContactMaterial = new CANNON.ContactMaterial(
  sphereBody.material,
  floorBody.material,
  {
    // 78.2.1 摩擦力
    friction: 0.1,
    // 78.2.2 弹性
    restitution: 0.7,
  }
);
// 78.3 将材料的关联设置添加的物理世界
world.addContactMaterial(defaultContactMaterial);

// 1.4 创建渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);
// 75.2.2 允许在场景中使用阴影贴图
renderer.shadowMap.enabled = true;


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
  const deltaTime = clock.getDelta();

  // 75.7 更新物理引擎世界里的物体
  world.step(1 / 60, deltaTime);
  // 75.8 浸染引擎的物体位置，复制物理引擎的物体位置
  sphere.position.copy(sphereBody.position);

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