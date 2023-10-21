<!-- 13.4.让汽车沿着轨道移动 -->
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

import dumpObject from '@/utils/dump-object.js';

let innerWidth = window.innerWidth;
let innerHeight = window.innerHeight;
const container = ref(null);

const gui = new GUI();
const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./draco/");
gltfLoader.setDRACOLoader(dracoLoader);

let scene, camera, renderer, controls;

let cars = [];

// 曲线
let curve, curveObject;

// 创建两个向量用于路径计算 
const carPosition = new THREE.Vector3();
const carTarget = new THREE.Vector3();

init();

// 初始化
function init() {
  createScene();
  createCamera(15, 10, 15);
  createRenderer();
  createAxes();
  // createAmbientTexture();
  createAmbientLight();
  // createDirLight();
  // createPointLight();
  // createSpotLight();
  window.addEventListener('resize', onWindowResize);
}

// 业务代码
function createCode() {
  gltfLoader.load('./model/other/cartoon_lowpoly_small_city_free_pack/scene3.gltf', gltf => {
    const scale = 0.005;
    const root = gltf.scene;
    root.scale.set(scale, scale, scale);
    scene.add(root);

    // 汽车轨迹线
    root.traverse(child => {
      if (child.name === '汽车轨迹线') {
        const line = child;
        line.visible = false;
        const points = [];
        const { position } = line.geometry.attributes;
        for (let i = position.count - 1; i >= 0; i--) {
          points.push(new THREE.Vector3(
            position.getX(i),
            position.getY(i),
            position.getZ(i)
          ));
        }

        // 创建曲线
        curve = new THREE.CatmullRomCurve3(points);

        {
          const points = curve.getPoints(50);
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
          curveObject = new THREE.Line(geometry, material);

          // 本案例特有代码
          const lineScale = 0.0092;
          curveObject.scale.set(lineScale, lineScale, lineScale);
          curveObject.position.set(-6.15, -0.3, 2.15);

          curveObject.visible = false;
          material.depthTest = false;
          curveObject.renderOrder = 1;
          scene.add(curveObject);
        }
      }
    });

    // 打印模型结构
    // console.log(dumpObject(root).join('\n'));

    // 获取Cars
    const loadedCars = root.getObjectByName('Cars');
    // 为不同类型的汽车添加不同的矫正量
    const fixes = [
      { prefix: 'Car_08', rot: [Math.PI * .5, 0, Math.PI * .5], },
      { prefix: 'CAR_03', rot: [0, Math.PI, 0], },
      { prefix: 'Car_04', rot: [0, Math.PI, 0], },
    ];
    // 更新物体及其后代的全局变换
    root.updateMatrixWorld();
    for (const car of loadedCars.children.slice()) {
      car.scale.set(scale, scale, scale);
      const fix = fixes.find(fix => car.name.startsWith(fix.prefix));
      // 通过创建包包裹对象obj，用于矫正坐标
      const obj = new THREE.Object3D();
      // 结果将被复制到这个obj.position
      car.getWorldPosition(obj.position);
      // 重置position
      car.position.set(0, 0, 0);
      // 重置rotation
      car.rotation.set(...fix.rot);
      obj.add(car);
      scene.add(obj);
      cars.push(obj);
    }

    // cars = root.getObjectByName('Cars');
    console.log(cars);
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
  renderer.setSize(innerWidth, innerHeight);
}

// 创建渲染函数
function render(time) {
  if (cars?.length && curve) {
    const pathTime = time * 0.00001;
    const targetOffset = 0.001;
    cars.forEach((car, ndx) => {
      // 一个介于 0 和 1 之间的数字，用于均匀间隔汽车
      const u = pathTime + ndx / cars.length;

      // 获取第一个点
      curve.getPointAt(u % 1, carPosition);
      carPosition.applyMatrix4(curveObject.matrixWorld);

      // 曲线再远点获取第二个点 
      curve.getPointAt((u + targetOffset) % 1, carTarget);
      carTarget.applyMatrix4(curveObject.matrixWorld);

      // // 把汽车放置在第一个点 （暂时的）
      car.position.copy(carPosition);
      // // 汽车的第二个点
      car.lookAt(carTarget.x, carTarget.y, carTarget.z);

      // // 放置小车在两个点中间
      car.position.lerpVectors(carPosition, carTarget, 0.5);
    });
  }

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

// 添加环境纹理
function createAmbientTexture() {
  const rgbeLoader = new RGBELoader();
  rgbeLoader.load('./hdr/noon_grass_1k.hdr', texture => {
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