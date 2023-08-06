<template>
  <div class="container" ref="container">
  </div>
</template>

<script setup>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { ref, onMounted } from 'vue';

const { innerWidth, innerHeight } = window;
const container = ref(null);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.z = 0.1;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(innerWidth, innerHeight);


/*
// 立方体：需要6一图
const geometry = new THREE.BoxGeometry(10, 10, 10);
const arr = ['4_l', '4_r', '4_u', '4_d', '4_b', '4_f'];
const boxMaterials = [];
arr.forEach(item => {
  const lexture = new THREE.TextureLoader().load(`./imgs/living/${item}.jpg`);
  if (['4_u', '4_d'].includes(item)) {
    lexture.rotation = Math.PI;
    lexture.center = new THREE.Vector2(0.5, 0.5);
  }
  boxMaterials.push(new THREE.MeshBasicMaterial({ map: lexture }));
});
const cube = new THREE.Mesh(geometry, boxMaterials);
cube.geometry.scale(1, 1, -1);
scene.add(cube);
*/

// 球体：需要一张图
const geometry = new THREE.SphereGeometry(5, 32, 32);
const loader = new RGBELoader();
loader.load('./imgs/hdr/Living.hdr', texture => {
  const material = new THREE.MeshBasicMaterial({ map: texture });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.geometry.scale(1, 1, -1);
  scene.add(sphere);
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

<style>
.container {
  width: 100vw;
  height: 100vh;
  background-color: #f0f0f0;
}
</style>