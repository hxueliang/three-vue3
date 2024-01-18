<!-- 72.切屏触发物体特效 -->
<template>
  <!-- 69.0.1 添加三个页面 -->
  <div class="page page1">
    <h1>THREE.Raycaster</h1>
    <h3>实现3d交互</h3>
  </div>
  <div class="page page2">
    <h1>THREE.BufferGeometry</h1>
    <h3>打造酷炫三角形</h3>
  </div>
  <div class="page page3">
    <h1>点光源</h1>
    <h3>围绕照亮小球</h3>
  </div>

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
import gsap from 'gsap';
import { DoubleSide } from 'three';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let container = ref(null);

// 1.1 创建场景
const scene = new THREE.Scene();

// 1.2 创建相机
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 300);
camera.position.set(0, 3, 18);
scene.add(camera);

// 69.1.1 渲染器允许透明【1.4 创建渲染器】
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(innerWidth, innerHeight);

// 69.1.3 修改立方体大小 【68.1 创建物体】
const geometry = new THREE.BoxGeometry(1.1, 1.1, 1.1);
const material = new THREE.MeshBasicMaterial({
  wireframe: true
});
const redMaterial = new THREE.MeshBasicMaterial({
  color: 0xff0000,
});
const cubeArr = [];
// 69.2.1 创建组
const cubeGroup = new THREE.Group();
// 69.1.4 修改立方体大小
for (let x = 0; x < 5; x++) {
  for (let y = 0; y < 5; y++) {
    for (let z = 0; z < 5; z++) {
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(x * 2 - 4, y * 2 - 4, z * 2 - 4);
      // 69.2.2 物体添加进组
      cubeGroup.add(cube);
      cubeArr.push(cube);
    }
  }
}
// 69.2.3 组添加进场景
scene.add(cubeGroup);

// 70. 酷炫三角形
const sjxGroup = new THREE.Group();
for (let i = 0; i < 50; i++) {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(9);
  for (let j = 0; j < 9; j++) {
    vertices[j] = Math.random() * 12 - 6;
  }
  // 17.2设置几何体的position属性
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  // 18.1创建随机颜色
  const color = new THREE.Color(Math.random(), Math.random(), Math.random(), 0.5);
  // 17.3创建材质
  const material = new THREE.MeshBasicMaterial({ color, opacity: 0.5, transparent: true, side: THREE.DoubleSide });
  // 17.4根据几何体和材质创建物体
  const mesh = new THREE.Mesh(geometry, material);
  sjxGroup.add(mesh);
}
// 70.1 把所有三角形y轴往下移30
sjxGroup.position.y = -30;
scene.add(sjxGroup);

// 71.1 弹跳小球
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial();
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
// 71.3.1 创建小球组
const sphereGroup = new THREE.Group();
// 56.5 开启物体投射阴影
sphere.castShadow = true;
sphereGroup.add(sphere);
// 56.2 添加平面
const planeGeometry = new THREE.PlaneGeometry(20, 20);
const plane = new THREE.Mesh(planeGeometry, sphereMaterial);
plane.position.y = -1;
plane.rotation.x = -Math.PI / 2;
// 56.6 开启物体接收阴影
plane.receiveShadow = true;
sphereGroup.add(plane);
// 58.0 添加 环境光
const light = new THREE.AmbientLight(0xffffff, 0.5);
sphereGroup.add(light);
// 58.1 添加 点光源
const pointLight = new THREE.PointLight(0xff0000, 20);
pointLight.castShadow = true;
// 58.2 创建小球
const lightBall = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 20, 20),
  new THREE.MeshBasicMaterial({ color: 0xff0000 }),
);
sphereGroup.add(lightBall);
// 58.3 将点光源添加到小球上
lightBall.add(pointLight);
lightBall.position.set(2, 2, 2);
// 58.0 模糊阴影的边缘
pointLight.shadow.radius = 20;
pointLight.shadow.mapSize.set(4096, 4096);
// 71.3.2 添加小球组进场景
sphereGroup.position.y = -60;
scene.add(sphereGroup);

// 68.2 创建投射光线
const raycaster = new THREE.Raycaster();
// 68.3 创建鼠标位置
const mouse = new THREE.Vector2();
// 68.4 监听鼠标点击事件
window.addEventListener('click', event => {
  mouse.x = event.clientX / window.innerWidth * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight * 2 - 1);
  raycaster.setFromCamera(mouse, camera);
  let result = raycaster.intersectObjects(cubeArr);
  // 68.5.1 把最前面的设置为red
  // result[0].object.material = redMaterial;
  // 68.5.2 把射线穿过的设置为red
  result.forEach(res => res.object.material = redMaterial);
});

const gui = new GUI();

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

// 72.4 gsap替代render函数，实现动画效果
gsap.to(cubeGroup.rotation, {
  x: '+=' + Math.PI,
  y: '+=' + Math.PI,
  duration: 5,
  repeat: -1
});
gsap.to(sjxGroup.rotation, {
  x: '+=' + Math.PI,
  y: '-=' + Math.PI,
  duration: 5,
  repeat: -1
});

// 1.5 创建渲染函数
function render() {
  const time = clock.getElapsedTime();

  // 69.2.4 设置级旋转
  // cubeGroup.rotation.x = time * 0.5;
  // cubeGroup.rotation.y = time * 0.5;

  // 70.2.2 根据当前滚动的位置scrollY，设置相机位置
  camera.position.y = -(window.scrollY / window.innerHeight) * 30;
  // 70.3 让三角形组旋转
  // sjxGroup.rotation.x = time * 0.4;
  // sjxGroup.rotation.y = time * 0.3;

  // 71.2 设置小球动起来
  lightBall.position.x = Math.sin(time * 2) * 3;
  lightBall.position.z = Math.cos(time * 2) * 3;
  lightBall.position.y = 2 + Math.sin(time * 10) / 3;
  // 71.4 让小球组旋转
  sphereGroup.rotation.x = Math.sin(time) * 0.04;
  // 72.3 与72.2的gsap动画冲突，先取消，有需要可以用gsap写重写动画
  // sphereGroup.rotation.z = Math.sin(time) * 0.04;

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

// 72.1 创建组数组
const groupArr = [cubeGroup, sjxGroup, sphereGroup];

// 70.2.1 监听滚动事件
let currentPage = 0;
window.addEventListener('scroll', () => {
  const newPage = Math.round(window.scrollY / window.innerHeight);
  if (currentPage !== newPage) {
    currentPage = newPage;
    console.log(currentPage);
    // 72.2 让当前页面下的3d物体转360度
    gsap.to(groupArr[currentPage].rotation, {
      z: '+=' + 2 * Math.PI,
    });
  }
});

onMounted(() => {
  // 69.1.2 关闭控制器，因为这个项目需要滚动事件
  // createControls();

  container.value.appendChild(renderer.domElement);
  render();
});
</script>

<style lang="less" scope>
.container {
  width: 100vw;
  height: 100vh;
  // 69.0.3 
  // background-color: #f0f0f0;
  position: fixed;
  left: 0;
  top: 0;
}

// 69.0.2 设置样式
.page {
  background-color: #101a35;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  overflow: hidden;

  h1 {
    margin: 60px;
    font-size: 40px;
  }

  h3 {
    font-size: 30px;
  }
}
</style>