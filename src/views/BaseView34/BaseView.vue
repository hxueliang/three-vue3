<!-- 134.打造元宇宙_胶囊机器人篇 -->
<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import gsap from 'gsap';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

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

import { Capsule } from 'three/examples/jsm/math/Capsule.js';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper.js';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
const container = ref(null);

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();
const gltfLoader = new GLTFLoader();

let scene, camera, renderer, controls;

let backCamera, activeCamera;

let stats, capsule, plane, group, worldOctree, emptyMesh;

let positionSound1, positionSound2;

// 机器人物体
let robot;
// 动作混合器
let mixer = null;
// 动画map
let actions = {};
// 激活的动作
let activeAction = null;
// 可以循环做的动作
const loopArr = ['Idle', 'Running', 'Walking'];

// 设置重力
const gravity = -9.8;
// 玩家速度
const playerVelocity = new THREE.Vector3(0, 0, 0);
// 玩家方向
const playerDirection = new THREE.Vector3(0, 0, 0);
// 玩家是否在地面上
let playerOnFloor = false;
// 创建一个人的碰撞体（胶囊形）
const playerCollider = new Capsule(
  new THREE.Vector3(0, 0.35, 0),
  new THREE.Vector3(0, 1.35, 0),
  0.35
);
// 按键状态
const keyStates = {
  'w': false,
  'a': false,
  's': false,
  'd': false,
  ' ': false,
  'isDown': false,
  'v': false,
};

// 给物体描边
class MeshLine {
  constructor(geometry) {
    const edges = new THREE.EdgesGeometry(geometry);
    this.material = new THREE.LineBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 1,
      // depthTest: false // 深度测试，若开启则是边框透明的效果
    });
    const line = new THREE.LineSegments(edges, this.material);
    this.geometry = edges;
    this.mesh = line;
  }
}

init();

// 初始化
function init() {
  createScene();
  createCamera(0, 5, 10);
  createBackCamera(0, 5, -10);
  createRenderer();
  createStats();
  createAxes();
  createHemisphereLight();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  createPlane();
  createStaircase();

  // 创建位置类型音乐
  positionSound1 = createSound('./audio/gnzw.mp3');
  positionSound2 = createSound('./audio/gyz.mp3');
  // 创建小球
  const sphere1 = createShpere(-10, 0, -10, 0xffff00);
  const sphere2 = createShpere(10, 0, 10, 0x0000ff);
  // 给小球添加音乐
  sphere1.add(positionSound1);
  sphere2.add(positionSound2);

  createLod();
  createCapsule();
  createRobot();
  cerateOctree();
  initKeyEvent();
  initMouseMoveEvent();
  initMouseDownEvent();
}

// 创建平面
function createPlane() {
  const geometry = new THREE.PlaneGeometry(20, 20, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: 0xfffffff,
    side: THREE.DoubleSide,
  });
  plane = new THREE.Mesh(geometry, material);
  plane.receiveShadow = true;
  plane.rotation.x = -Math.PI / 2; // + 0.2; // 爬坡测试
}

// 创建小球，用来设置声音源
function createShpere(x = 0, y = 0, z = 0, color = 0xff0000) {
  const geometry = new THREE.SphereGeometry(1, 32, 16);
  const material = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide,
  });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(x, y, z);
  scene.add(sphere);
  return sphere;
};

// 创建音乐
function createSound(url) {
  // 创建一个虚拟的listener，表示在场景中所有相关的音效，他是音频实体构造函数的必须参数
  const listener = new THREE.AudioListener();
  // 大多数情况下，listener对象是camera的子对象，Camera的3D变换表示了listener的3D变换
  camera.add(listener);

  // 创建一个位置相关的音频对象
  const positionSound = new THREE.PositionalAudio(listener);
  // 创建音频加载器
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load(url, (buffer) => {
    positionSound.setBuffer(buffer);
    positionSound.setRefDistance(0.5);
  });

  return positionSound;
}

// 创建楼梯，通过立方体堆叠实现
function createStaircase() {
  let i = 0;
  for (i = 0; i < 10; i++) { createCube(i, 0); }
  for (i = 0; i < 10; i++) { createCube(i, 5); }

  const x = 2.5, y = 1, width = 6, height = 0.2, depth = 1;
  createCube(i, x, y, width, height, depth);
}

// 多细节层次
function createLod() {
  // 多细节层次
  const lod = new THREE.LOD();
  const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true,
  });
  for (let i = 0; i < 4; i++) {
    const pow = 4 - i;
    const geometry = new THREE.SphereGeometry(1, 2 ** pow, 2 ** pow);
    const mesh = new THREE.Mesh(geometry, material);
    lod.addLevel(mesh, i * 12);
  }
  lod.position.set(-10, 0, 10);
  scene.add(lod);
}

// 创建台阶
function createCube(i, x = 0, y = 1, width = 1, height = 0.2, depth = 1) {
  // 因为是地面x轴旋转90度，其子元素yz轴互换方向
  const geometry = new THREE.BoxGeometry(width, depth, height);
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00, });
  const cube = new THREE.Mesh(geometry, material);
  cube.position.y = -(i * 0.3 + y);
  cube.position.z = i * 0.2 + 0.2;
  cube.position.x = x;
  plane.add(cube);

  const meshLine = new MeshLine(cube.geometry);
  meshLine.mesh.position.copy(cube.position);
  plane.add(meshLine.mesh);

}

// 创建一个胶囊物体
function createCapsule() {
  capsule = new THREE.Object3D();
  capsule.position.set(0, (0.35 + 1 + 0.35) / 2, 0);
  // 实现相机跟随胶囊移动
  // 将相机作为胶囊的子元素
  camera.position.set(0, 4, -10);
  camera.lookAt(capsule.position);
  backCamera.position.set(0, 4, 10);
  backCamera.lookAt(capsule.position);
  // 创建空物体，创建相机的上下方向
  // 胶囊-空物体-相机
  emptyMesh = new THREE.Object3D();
  emptyMesh.add(camera);
  emptyMesh.add(backCamera);
  capsule.add(emptyMesh);
  // 控制器设置中心为胶囊位置
  controls && (controls.target = capsule.position);

  scene.add(capsule);
}

// 创建机器人
function createRobot() {
  gltfLoader.load('./model/metaverse/robotExpressive.glb', gltf => {
    console.log(gltf);
    const { animations, scene: robotScene } = gltf;
    robot = robotScene;
    robot.scale.set(0.5, 0.5, 0.5);
    robot.position.set(0, -0.75, 0);
    capsule.add(robot); // 做为胶囊的子物体

    mixer = new THREE.AnimationMixer(robot);
    animations.forEach(animation => {
      const { name } = animation;
      actions[name] = mixer.clipAction(animation);
      if (loopArr.includes(name)) {
        actions[name].clampWhenFinished = false;
        actions[name].loop = THREE.LoopRepeat;
      } else {
        actions[name].clampWhenFinished = true; // 动画将在最后一帧之后自动暂停
        actions[name].loop = THREE.LoopOnce; // 执行一次
      }
    });
    activeAction = actions['Idle'];
    activeAction.play();
    console.log(actions);

  });
}

// 更新玩家数据
function updatePlayer(deltaTime) {
  // 阻尼，可以理解为胶囊与地面的摩擦系数
  let damping = -0.08;
  if (playerOnFloor) {
    // 如果玩家已经在地面上，让下降速度重置为0
    playerVelocity.y = 0;
    // 停止键按的时，设置摩擦力，让胶囊自己停下来
    // addScaledVector将所传入的向量v与标量s相乘，所得的乘积和这个向量相加
    keyStates.isDown || playerVelocity.addScaledVector(playerVelocity, damping);
  } else {
    // 否则，下降速度随时间推移，不断增大
    playerVelocity.y += gravity * deltaTime;
  }
  // 计算玩家移动的距离
  const playerMoveDistance = playerVelocity.clone().multiplyScalar(deltaTime);
  playerCollider.translate(playerMoveDistance);
  // 设置胶囊位置 
  playerCollider.getCenter(capsule.position);

  playerCollisions();

  // 如果有水平移动，则设置相应动画
  const moveVelocity = Math.abs(playerVelocity.x) + Math.abs(playerVelocity.z);
  if (moveVelocity > 2.5) {
    toAction('Running');
  } else if (moveVelocity > 0.1) {
    toAction('Walking');
  } else {
    toAction('Idle');
  }
}

// 创建八叉树，用于碰撞检测组
function cerateOctree({ helper } = {}) {
  group = new THREE.Group();
  group.add(plane);
  scene.add(group);

  worldOctree = new Octree();
  worldOctree.fromGraphNode(group);

  if (helper) {
    // 创建OctreeHelper
    const octreeHelper = new OctreeHelper(worldOctree);
    scene.add(octreeHelper);
  }
}

// 玩家碰撞检测
function playerCollisions() {
  const result = worldOctree.capsuleIntersect(playerCollider);
  // 默认不在地面上
  playerOnFloor = false;
  if (result) {
    playerOnFloor = result.normal.y > 0;
    // playerCollider，延法向方移动陷入深度(回到碰撞表面)
    playerCollider.translate(result.normal.multiplyScalar(result.depth));
  }
}

// 重置玩家信息
function resetPlayer() {
  if (capsule.position.y < -20) {
    playerCollider.start.set(0, 2 + 0.35, 0);
    playerCollider.end.set(0, 2 + 1.35, 0);
    playerCollider.radius = 0.35;
    playerVelocity.set(0, 0, 0);
    playerDirection.set(0, 0, 0);
  }
}

// 监听键盘按下事件
function initKeyEvent() {
  const isDown = true;
  document.addEventListener('keydown', event => updateKeyState(event, isDown), false);
  document.addEventListener('keyup', event => updateKeyState(event, !isDown), false);
}

// 跟据键盘事件更新按键状态
function updateKeyState(event, isDown) {
  const { key } = event;
  // if (!(key in keyStates)) {
  //   return;
  // }
  keyStates[event.key] = isDown;
  keyStates.isDown = isDown;
  // 按键抬起事件
  !isDown && keyUpEvent(event);
}

function keyUpEvent(event) {
  // 抬超v键时切换相机视角
  if (event.key === 'v') {
    activeCamera = activeCamera === camera ? backCamera : camera;
  }
  if (event.key === 't') {
    toAction('Wave');
  }
}

// 执行动画
function toAction(actionName) {
  if (!activeAction) {
    return;
  }
  let prevAction = activeAction;
  activeAction = actions[actionName];
  if (prevAction !== activeAction) {
    actionOutIn(prevAction, activeAction);
    // 动画完成，回到Idle动画
    mixer.addEventListener('finished', () => {
      let prevAction = activeAction;
      activeAction = actions['Idle'];
      actionOutIn(prevAction, activeAction);
    });
  }
}

// 让上一个动画淡出，新的动画渐入
function actionOutIn(prevAction, activeAction) {
  prevAction.fadeOut(0.3); // 在传入的时间间隔内，逐渐将此动作的权重由1降至0
  activeAction
    .reset()
    .setEffectiveTimeScale(1) // 设置时间比例为1，以及停用所有的变形
    .setEffectiveWeight(1) // 设置权重为1，以及停止所有淡入淡出
    .fadeIn(0.3) // 在传入的时间间隔内，逐渐将此动作的权重由0升到1
    .play();
}

// 监听鼠标移动事件
function initMouseMoveEvent(close) {
  window.addEventListener('mousemove', event => {
    if (close) { return; }
    // 设置胶囊旋转
    // movementX鼠标在水平方向上的移动值
    capsule.rotation.y -= event.movementX * 0.003;
    // 通过控制空物体上下方向，改变相机上下方向
    emptyMesh.rotation.x += event.movementY * 0.003;
    // 限制上下方向最大小角度
    if (emptyMesh.rotation.x > Math.PI / 8) {
      emptyMesh.rotation.x = Math.PI / 8;
    }
    if (emptyMesh.rotation.x < -Math.PI / 8) {
      emptyMesh.rotation.x = -Math.PI / 8;
    }
  });
}

// 监听鼠标按下事件
function initMouseDownEvent() {
  window.addEventListener('mousedown', event => {
    // 让音乐播放
    positionSound1.play();
    positionSound2.play();
    if (controls) { return; }
    // 锁定鼠标指针
    document.body.requestPointerLock();
  }, false);
}

// 根据键盘状态更新玩家速度
function controlPlayer(time) {
  if (keyStates.w) {
    playerDirection.z = 1;
    const capsuleFront = new THREE.Vector3(0, 0, 0);
    // 获取胶囊正前面的方向
    // getWorldDirection是将表示该物体在世界空间中Z轴正方向的矢量，保存到capsuleFront
    capsule.getWorldDirection(capsuleFront);
    // 计算玩家速度
    // multiplyScalar将该向量与所传入的标量进行相乘
    // add将传入的向量和这个向量相加
    playerVelocity.add(capsuleFront.multiplyScalar(time));
  }
  if (keyStates.s) {
    playerDirection.z = 1;
    const capsuleFront = new THREE.Vector3(0, 0, 0);
    capsule.getWorldDirection(capsuleFront);
    playerVelocity.add(capsuleFront.multiplyScalar(-time));
  }
  if (keyStates.a) {
    playerDirection.z = 1;
    const capsuleFront = new THREE.Vector3(0, 0, 0);
    capsule.getWorldDirection(capsuleFront);
    // 计算侧方向
    // 正前方向和正上方向可以确定一个面，求叉积，得到侧方向
    // capsuleFront正前方向
    // capsule.up正上方向
    // cross将该向量设置为它本身与传入的向量v的叉积
    capsuleFront.cross(capsule.up);
    playerVelocity.add(capsuleFront.multiplyScalar(-time));
  }
  if (keyStates.d) {
    playerDirection.z = 1;
    const capsuleFront = new THREE.Vector3(0, 0, 0);
    capsule.getWorldDirection(capsuleFront);
    capsuleFront.cross(capsule.up);
    playerVelocity.add(capsuleFront.multiplyScalar(time));
  }
  if (keyStates[' ']) {
    playerVelocity.y = 15;
  }
}

// 创建场景
function createScene() {
  scene = new THREE.Scene();
  // 新增
  scene.background = new THREE.Color(0x88ccee);
  scene.fog = new THREE.Fog(0x88ccee, 0, 50);
}

// 创建相机
function createCamera(x = 0, y = 0, z = 10) {
  camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.001, 1000);
  camera.position.set(x, y, z);
  activeCamera = camera;
  scene.add(camera);
}

// 创建后背相机
function createBackCamera(x = 0, y = 0, z = -10) {
  backCamera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.001, 1000);
  backCamera.position.set(x, y, z);
  scene.add(backCamera);
}


// 创建渲染器
function createRenderer() {
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  // 新增
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
}

// 创建渲染函数
function render() {
  const time = clock.getDelta();

  controlPlayer(time);
  updatePlayer(time);
  resetPlayer();

  mixer && mixer.update(time);

  controls && controls.update();
  renderer.render(scene, activeCamera);
  requestAnimationFrame(render);
};

// 创建性能监控
function createStats() {
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0';
}

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

// 添加半球光
function createHemisphereLight(strength = 1, skyColor = '#ffffff', groundColor = '#B97A20') {
  const hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, strength);
  scene.add(hemisphereLight);
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

// 添加stats进DOM
function appendStats() {
  container.value.appendChild(stats.domElement);
}

onMounted(() => {
  appendCanvas();
  appendStats();
  createCode();
  // createControls();
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