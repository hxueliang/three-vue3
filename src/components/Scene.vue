<template>
  <div class="scene" ref="sceneRef"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import gsap from 'gsap';
import * as THREE from 'three';

import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

import '@/three/init';
import scene from '@/three/scene';
import camera from '@/three/camera';
import renderer from '@/three/renderer';
import axesHelper from '@/three/axesHelper';
import controls from '@/three/controls';
import animate from '@/three/animate';
// import gui from '@/three/gui';
import createMesh from '@/three/createMesh';
import AlarmSprite from '@/three/mesh/AlarmSprite';
import LightWall from '@/three/mesh/LightWall';
import FlyLineShader from '@/three/mesh/FlyLineShader';

const sceneRef = ref(null);
const props = defineProps(['eventList']);

scene.add(camera);
scene.add(axesHelper);

createMesh();

onMounted(() => {
  sceneRef.value.appendChild(renderer.domElement);
  animate();
});

const mapFn = {
  火警: position => {
    const lightWall = new LightWall(position, 1, 1.5);
    scene.add(lightWall.mesh);
    eventListMesh.push(lightWall);
  },
  治安: position => {
    const randomColor = new THREE.Color(
      Math.random(),
      Math.random(),
      Math.random(),
    ).getHex();
    const flyLine = new FlyLineShader(position, randomColor);
    scene.add(flyLine.mesh);
    eventListMesh.push(flyLine);
  },
};

const eventListMesh = [];

watch(
  () => props.eventList,
  value => {
    console.log(value);
    eventListMesh.forEach(item => {
      item.remove();
    });
    props.eventList.forEach(item => {
      const position = {
        x: item.position.x / 5 - 10,
        z: item.position.y / 5 - 10,
      };

      const alarmSprite = new AlarmSprite(item.name, position);
      scene.add(alarmSprite.mesh);
      eventListMesh.push(alarmSprite);

      const fn = mapFn[item.name];
      fn && fn(position);

    });
  }
);
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