<template>
  <div class="scene" ref="sceneRef"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as THREE from 'three';

import '../three/init';
import scene from '../three/scene';
import CameraModule from '../three/camera';
import renderer from '../three/renderer';
import axesHelper from '../three/axesHelper';
import animate from '../three/animate';

import createMesh from '../three/createMesh';

const sceneRef = ref(null);

scene.add(CameraModule.activeCamera);
scene.add(axesHelper);

createMesh();

onMounted(() => {
  sceneRef.value.appendChild(renderer.domElement);
  animate();
});

</script>

<style lang="less" scope>
.scene {
  width: 100vw;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
}
</style>
<style>
body {
  background-color: #1e1a20;
}
</style>