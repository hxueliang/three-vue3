<!-- 182.导航巡视城市 -->
<template>
  <div class="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import gsap from 'gsap';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import * as YUKA from 'yuka';
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
const container = ref(null);

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

let scene, camera, renderer, controls;

let entityManager;

let vehicle, navMesh;

init();

// 初始化
function init() {
  createScene();
  createCamera(1, 10, 30);
  createRenderer();
  createAmbient();
  window.addEventListener('resize', onWindowResize);
}


class CustomVechicle extends YUKA.Vehicle {
  constructor(navMesh) {
    super();
    this.navMesh = navMesh;
  }

  update(delta) {
    super.update(delta);
    // 处理小车行径时，窜入地面
    const currentRegion = navMesh.getRegionForPoint(vehicle.position);
    if (currentRegion) {
      const distance = currentRegion.distanceToPoint(vehicle.position);
      vehicle.position.y -= distance * 0.2;
    }
  }
}

// 业务代码
function createCode() {
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./draco/');
  gltfLoader.setDRACOLoader(dracoLoader);
  // 加载地面模型
  let plane;
  gltfLoader.load('./model/yuka/modelMap.gltf', gltf => {
    plane = gltf.scene;
    plane.traverse(child => {
      if (child.isMesh) {
        child.receiveShadow = true;
        child.castShadow = true;
      }
    });
    scene.add(plane);
  });

  // 设置车辆的渲染对象
  function callback(entity, renderComponent) {
    renderComponent.position.copy(entity.position);
    renderComponent.quaternion.copy(entity.rotation);
  }

  // 创建目标小球
  const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const sphereMaterail = new THREE.MeshBasicMaterial({ color: 0xff00ff });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterail);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  scene.add(sphere);

  // 创建目标
  const target = new YUKA.GameEntity();
  target.setRenderComponent(sphere, callback);
  setPosition();

  // 设置随机位置
  function setPosition() {
    target.position.set(Math.random() * 20 - 10, 0, Math.random() * 20 - 10);
  }

  // 点击修改目标位置
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  window.addEventListener('pointerdown', event => {
    ndc.x = event.clientX / window.innerWidth * 2 - 1;
    ndc.y = -(event.clientY / window.innerHeight * 2 - 1);
    raycaster.setFromCamera(ndc, camera);
    let intersects = raycaster.intersectObject(plane);
    if (intersects.length === 0) { return; }
    const { point } = intersects[0];
    target.position.set(point.x, 0, point.z);

    const from = vehicle.position;
    const to = point;

    // 根据导航网格获取路径
    const path = navMesh.findPath(from, to);
    // 生成YUKA路径
    const path1 = new YUKA.Path();
    path.forEach(({ x, y, z }) => path1.add(new YUKA.Vector3(x, y, z)));
    drawPathLine(path1);

    // 清除以有行为
    vehicle.steering.clear();

    // 到终点行为
    const arriveBehavior = new YUKA.ArriveBehavior(to, 3, 0.1);
    vehicle.steering.add(arriveBehavior);

    // 在路径上行为
    const onPathBehavior = new YUKA.OnPathBehavior(path1, 0.1, 0.1);
    vehicle.steering.add(onPathBehavior);
  });

  // 绘制路径
  let line;
  function drawPathLine(path) {
    if (line) {
      scene.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    }
    const positions = [];
    const { _waypoints } = path;
    for (let i = 0; i < _waypoints.length; i++) {
      const { x, y, z } = _waypoints[i];
      positions.push(x, y, z);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3)
    );
    const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
    line = new THREE.Line(geometry, material);
    scene.add(line);
  }

  // 创建实体管理对象
  entityManager = new YUKA.EntityManager();
  entityManager.add(target);

  // 创建网格加载器
  const navMeshLoader = new YUKA.NavMeshLoader();
  // 加载网格
  navMeshLoader.load('./model/yuka/modelMap.gltf').then(navigationMesh => {
    console.log(navigationMesh);
    navMesh = navigationMesh;

    // 创建yuka的车辆
    vehicle = new CustomVechicle(navMesh);
    vehicle.maxSpeed = 5;
    entityManager.add(vehicle);

    // 加载汽车模型
    gltfLoader.load('./model/yuka/car.gltf', gltf => {
      gltf.scene.children[0].rotation.y = Math.PI / 2;
      gltf.scene.children[0].scale.set(0.5, 0.5, 0.5);
      scene.add(gltf.scene);
      vehicle.setRenderComponent(gltf.scene, callback);
    });
  });
}

// 创建场景
function createScene() {
  scene = new THREE.Scene();
}

// 创建相机
function createCamera(x = 0, y = 0, z = 10) {
  camera = new THREE.PerspectiveCamera(25, innerWidth / innerHeight, 0.1, 3000);
  camera.position.set(x, y, z);
  scene.add(camera);
}

// 创建渲染器
function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setSize(innerWidth, innerHeight);

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8;
}
const time = new YUKA.Time();
// 创建渲染函数
function render() {
  const delta = time.update().getDelta();
  entityManager && entityManager.update(delta);

  controls && controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

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

// 添加环境贴图
function createAmbient() {
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load('./hdr/013.hdr', envMap => {
    envMap.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = envMap;
    scene.environment = envMap;
  });
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

// 添加聚光灯
function createSpotLight(
  x = 0, y = 0, z = 10,
  strength = 1, color = '#ffffff', distance = 0, angle = Math.PI / 3, penumbra = 0,
  castShadow = false
) {
  const light = new THREE.SpotLight(color, strength, distance, angle, penumbra);
  light.position.set(x, y, z);
  light.castShadow = castShadow;
  scene.add(light);
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

onMounted(() => {
  createCode();
  appendCanvas();
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