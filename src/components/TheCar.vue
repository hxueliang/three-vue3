<template>
  <div class="home">
    <div class="canvas" ref="canvas"></div>

    <div class="contnet">

    </div>
  </div>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { ref, onMounted } from 'vue';



const { innerWidth, innerHeight } = window;
const canvas = ref(null);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(0, 2, 6);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setSize(innerWidth, innerHeight);


const gridHelper = new THREE.GridHelper(10, 10);
gridHelper.material.opacity = 0.2;
gridHelper.material.transparent = true;
scene.add(gridHelper);


let caontrols = null;
function render() {
  caontrols && caontrols.update();

  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

// 存储物体（汽车零件）
let carWheels = []; // 轮毂
let carBody, carFront, carHood, carGlass;



const bodyMaterial = createMetarial();
const frontMaterial = createMetarial();
const hoodMaterial = createMetarial();
const wheelsMaterial = createMetarial(0xff0000, 1, 0, 1, undefined, undefined);;
const glassMaterial = createGlassMetarial();

const selectColor = (index, colors) => {
  bodyMaterial.color.set(colors[index]);
  frontMaterial.color.set(colors[index]);
  hoodMaterial.color.set(colors[index]);
  wheelsMaterial.color.set(colors[index]);
  // glassMaterial.color.set(colors[index]);
};
let selectMaterial = (index, materials) => {
  bodyMaterial.clearcoatRoughness = materials[index].value;
  frontMaterial.clearcoatRoughness = materials[index].value;
  hoodMaterial.clearcoatRoughness = materials[index].value;
  glassMaterial.clearcoatRoughness = materials[index].value;
};

// 创建材质
function createMetarial(
  color = 0xff0000,
  metalness = 1,
  roughness = 0.5,
  clearcoat = 1,
  clearcoatRoughness = 0,
) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness,
    roughness,
    clearcoat, // 清漆
    clearcoatRoughness, // 清漆粗糙度
  });
}

// 创建玻璃材质
function createGlassMetarial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0,
    transmission: 1,
    transparent: true,
  });
}

// 载入gltf汽车模型
function createCar() {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./draco/');
  loader.setDRACOLoader(dracoLoader);
  loader.load('./model/bmw01.glb', gltf => {
    const bmw = gltf.scene;
    // console.log(bmw);
    bmw.traverse(child => {
      if (!child.isMesh) { return; }
      if (child.name.includes('轮毂')) {
        child.material = wheelsMaterial;
        carWheels.push(child);
      }
      if (child.name.includes('Mesh002')) {
        carBody = child;
        child.material = bodyMaterial;
      }
      if (child.name.includes('前脸')) {
        carFront = child;
        child.material = frontMaterial;
      }
      if (child.name.includes('引擎盖_1')) {
        carHood = child;
        child.material = hoodMaterial;
      }
      if (child.name.includes('挡风玻璃')) {
        child.material = glassMaterial;
        carGlass = child;
      }
    });
    scene.add(bmw);
  });
}

// 创建灯光
function createLight(x = 0, y = 0, z = 0, strength = 1, color = 0xffffff) {
  const light = new THREE.DirectionalLight(color, strength);
  light.position.set(x, y, z);
  scene.add(light);
}

onMounted(() => {
  caontrols = new OrbitControls(camera, canvas.value);
  caontrols.enableDamping = true;

  canvas.value.appendChild(renderer.domElement);
  renderer.setClearColor('#000');
  scene.background = new THREE.Color('#ccc');
  scene.environment = new THREE.Color('#ccc');
  render();

  createCar();

  createLight(0, 0, 10);
  createLight(0, 0, -10);
  createLight(10, 0, 0);
  createLight(-10, 0, 0);

  createLight(0, 10, 0);
  createLight(5, 10, 0);
  createLight(-5, 10, 0);
  createLight(0, 10, 5);
  createLight(0, 10, -5);

  createCar();
  console.log(carBody);
});

defineExpose({
  selectColor,
  selectMaterial
});
</script>

<style>
.canvas {
  width: 100vw;
  height: 100vh;
  background-color: #f0f0f0;
}
</style>
