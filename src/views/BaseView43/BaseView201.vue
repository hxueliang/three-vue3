<!-- 201.科技物理世界 -->
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
import { PointerLockControlsCannon } from './threeMesh/PointerLockControlsCannon';
import nipplejs from 'nipplejs';


import {
  color,
  float,
  vec2,
  texture,
  normalMap,
  uv,
  MeshPhysicalNodeMaterial,
  mx_noise_vec3,
  EnvironmentNode,
} from "three/nodes";
import { nodeFrame } from "three/addons/renderers/webgl/nodes/WebGLNodes.js";
import { FlakesTexture } from "three/addons/textures/FlakesTexture.js";
import { Reflector } from './mesh/Reflector';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
let devicePixelRatio = window.devicePixelRatio;
const container = ref(null);

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/");
gltfLoader.setDRACOLoader(dracoLoader);

let scene, camera, renderer, controls;

let world, sphereMesh, sphereBody;

let robot;

let manager;

init();

// 初始化
function init() {
  createScene();
  createCamera(0, 1, 10);
  createRenderer();
  createAxes();
  createAmbientTexture();
  createAmbientLight();
  // createDirLight();
  // createPointLight();
  // createSpotLight();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  // 初始化cannon
  world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);

  // 初始化物理材质
  world.defaultContactMaterial.contactEquationStiffness = 1e9;
  world.defaultContactMaterial.contactEquationRelaxation = 4;

  // // 设置物理引擎的求解器
  const solver = new CANNON.GSSolver();
  solver.iterations = 7; // 一帧内最大的迭代7次
  solver.tolerance = 0.1; // 容差值，两次迭代0.1，就可以不计算了

  world.solver = new CANNON.SplitSolver(solver);

  // 创建材质
  const physicsMaterial = new CANNON.Material('physics');
  const physics_physics = new CANNON.ContactMaterial(
    physicsMaterial,
    physicsMaterial,
    {
      friction: 0, // 当摩擦力为0时，物体不会滑动
      restitution: 0.7, // 弹性系数
    }
  );
  world.addContactMaterial(physics_physics);

  // 创建球刚体
  const radius = 0.82;
  sphereBody = new CANNON.Body({
    mass: 5,
    shape: new CANNON.Sphere(radius),
    material: physicsMaterial,
  });
  sphereBody.position.set(0, 5, 10);
  sphereBody.linearDamping = 0.9; // 添加线性阻力
  world.addBody(sphereBody);

  // 创建球体
  const sphereGeometry = new THREE.SphereGeometry(radius, 8, 8);
  const sphereMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff0000,
    wireframe: true,
  });
  sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphereMesh);

  // 创建平面刚体
  const planeBody = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
    material: physicsMaterial,
  });
  planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  world.addBody(planeBody);

  // 加载平面
  gltfLoader.load('./model/roomModel/ground03.glb', gltf => {
    // 添加镜面反射
    const mirrorGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMirror = new Reflector(mirrorGeometry, {
      clipBias: 0.003,
      textrueWidth: innerWidth * devicePixelRatio,
      textrueHeight: innerHeight * devicePixelRatio,
      color: 0x777777,
    });
    groundMirror.position.y = 0.1;
    groundMirror.rotateX(-Math.PI / 2);
    scene.add(groundMirror);
    scene.add(gltf.scene);
  });

  gltfLoader.load('./model/roomModel/robot.glb', gltf => {
    robot = gltf.scene;
    robot.children[0].position.set(0, -radius, 0);
    robot.children[0].rotation.set(0, Math.PI, 0);
    // robot.add(camera);
    // sphereMesh.add(camera);
    sphereMesh.add(robot);
  });

  // 加载碰撞模型
  gltfLoader.load('./model/roomModel/collisions.glb', gltf => {
    const model = gltf.scene;
    model.traverse(child => {
      if (!child.isMesh) { return; }
      const { geometry, materail, position, rotation, scale, quaternion } = child;
      const { x, y, z } = scale;

      // const mesh = new THREE.Mesh(geometry, materail);
      // mesh.position.copy(position);
      // mesh.rotation.copy(rotation);
      // mesh.scale.copy(scale);
      // scene.add(mesh);

      const shape = new CANNON.Box(new CANNON.Vec3(x, y, z));
      const body = new CANNON.Body({ mass: 0, material: physicsMaterial });
      body.addShape(shape);
      body.position.copy(position);
      body.quaternion.copy(quaternion);
      world.addBody(body);
    });
  });

  // 柱子
  gltfLoader.load('./model/roomModel/ground.glb', gltf => {
    // 珠光漆材质
    const flakesTexture = new FlakesTexture();
    const canvasTexture = new THREE.CanvasTexture(flakesTexture);
    canvasTexture.anisotropy = 16;
    canvasTexture.wrapS = THREE.RepeatWrapping;
    canvasTexture.wrapT = THREE.RepeatWrapping;

    const nodeMaterial = new MeshPhysicalNodeMaterial();

    nodeMaterial.colorNode = color(0xeeeeff);
    nodeMaterial.normalNode = normalMap(
      texture(canvasTexture, uv().mul(2.5, 1.5)),
      0.15
    );
    nodeMaterial.metalnessNode = float(0.9);
    nodeMaterial.roughnessNode = float(0.5);
    nodeMaterial.clearcoatNode = float(1);
    nodeMaterial.clearcoatRoughnessNode = float(0.01);
    const model = gltf.scene;
    model.traverse(child => {
      if (!child.isMesh) { return; }
      child.material = nodeMaterial;
    });
    scene.add(model);
  });

  // 主舞台
  gltfLoader.load('./model/roomModel/stage.glb', gltf => {
    const model = gltf.scene;
    // 添加碳纤维材质
    const nodeMaterial = new MeshPhysicalNodeMaterial();
    const carbonTexture = textureLoader.load('./texture/carbon/Carbon.png');
    carbonTexture.colorSpace = THREE.SRGBColorSpace;
    carbonTexture.wrapS = THREE.RepeatWrapping;
    carbonTexture.wrapT = THREE.RepeatWrapping;
    const carbonNormalTexture = textureLoader.load('./texture/carbon/Carbon_Normal.png');
    carbonNormalTexture.colorSpace = THREE.SRGBColorSpace;
    carbonNormalTexture.wrapS = THREE.RepeatWrapping;
    carbonNormalTexture.wrapT = THREE.RepeatWrapping;
    const carbonUv = uv().mul(5);
    nodeMaterial.colorNode = texture(carbonTexture, carbonUv);
    nodeMaterial.normalNode = normalMap(texture(carbonNormalTexture, carbonUv));

    nodeMaterial.metalnessNode = float(0.9);
    nodeMaterial.roughnessNode = float(0.5);
    nodeMaterial.clearcoatNode = float(1);
    nodeMaterial.clearcoatRoughnessNode = float(0.01);

    model.traverse(child => {
      if (child.isMesh && child.material.name === 'Material_579') {
        child.material = nodeMaterial;
      }
    });
    scene.add(model);
  });

  // 副舞台
  gltfLoader.load('./model/roomModel/stage02.glb', gltf => {
    const model = gltf.scene;
    scene.add(model);
  });

  // 展板
  gltfLoader.load('./model/roomModel/board.glb', gltf => {
    const model = gltf.scene;
    scene.add(model);
  });

  // 灯光
  gltfLoader.load('./model/roomModel/light.glb', gltf => {
    const model = gltf.scene;
    model.traverse(child => {
      child.intensity = 0.1;
    });
    scene.add(model);
  });

  initPointerLockControls();
}

function initPointerLockControls() {
  controls = new PointerLockControlsCannon(camera, sphereBody);
  scene.add(controls.getObject());

  renderer.domElement.addEventListener('click', () => controls.lock());
  controls.addEventListener('lock', () => {
    console.log('lock');
    controls.enabled = true;
  });
  controls.addEventListener('unlock', () => {
    console.log('unlock');
    controls.enabled = false;
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
  camera.lookAt(0, 0, -2);
  scene.add(camera);
}


// 创建渲染器
function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
}

// 创建渲染函数
function render() {
  const delta = clock.getDelta();

  world.step(1 / 60, delta, 3);

  sphereMesh.position.copy(sphereBody.position);

  robot && robot.quaternion.copy(controls.getObject().quaternion);

  controls && controls.update(delta);
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

// 添加环境纹理
function createAmbientTexture() {
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load('./hdr/0006_4k.hdr', texture => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
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
function createSpotLight(x = 0, y = 0, z = 10, strength = 1000, color = '#ffffff', castShadow = false) {
  const light = new THREE.SpotLight(color, strength);
  light.position.set(x, y, z);
  light.castShadow = castShadow;
  scene.add(light);
  return light;
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