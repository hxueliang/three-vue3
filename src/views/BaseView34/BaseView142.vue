<!-- 142.智慧城市 -->
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
  threePlus.setBg("./hdr/sky11.hdr");

  // threePlus.addClouds();
  threePlus.addCloudsPlus();

  threePlus.addOcean();

  const metaScene = await threePlus.gltfLoader('./model/metaverse/metaScene.glb');
  threePlus.scene.add(metaScene.scene);

  threePlus.setLight();
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