<template>
  <div class="home">
    <div class="canvas" ref="canvas">
    </div>
  </div>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { ref, onMounted } from 'vue';

const { innerWidth, innerHeight } = window;
const canvas = ref(null);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.z = 10;
scene.add(camera);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const metarial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(geometry, metarial);
scene.add(cube);

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(10, 10, 10);
scene.add(light);



let caontrols = null;
function render() {
  caontrols && caontrols.update();

  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

onMounted(() => {
  caontrols = new OrbitControls(camera, canvas.value);
  caontrols.enableDamping = true;

  canvas.value.appendChild(renderer.domElement);
  render();
});
</script>

<style>
.canvas {
  width: 100vw;
  height: 100vh;
  background-color: #f0f0f0;
}
</style>