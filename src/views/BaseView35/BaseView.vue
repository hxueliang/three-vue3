<!-- 143.日夜交替洒店 -->
<template>
  <div class="home" ref="screenDom">
    <div class="canvas-container"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as THREE from "three";
import ThreePlus from "./three/index";

let screenDom = ref(null);

const resizeFn = () => {
  let scale = window.innerWidth / 1920;
  screenDom.value.style.transform = `scale(${scale})`;
};

onMounted(() => {
  resizeFn();
  window.addEventListener("resize", resizeFn);
});

onMounted(async () => {
  let threePlus = new ThreePlus(".canvas-container");
  window.threePlus = threePlus;
  threePlus.camera.position.set(-117, 17, -140);

  threePlus.setBg('./hdr/023.hdr');
  threePlus.addOcean();

  const gltf = await threePlus.gltfLoader('./public/model/hotel/building.glb');
  const metaScene = gltf.scene;
  threePlus.scene.add(metaScene);
  metaScene.traverse(child => {
    if (child.isMesh && child.name === 'Plane') {
      child.visible = false;
    }
  });
});

</script>

<style lang="less" scope>
.home {
  width: 1920px;
  height: 1080px;
  transform-origin: 0 0;
}

.canvas-container {
  width: 100%;
  height: 100%;
}
</style>