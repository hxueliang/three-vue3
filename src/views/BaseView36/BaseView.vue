<!-- 144.3d图表 -->
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

onMounted(() => {
  const threePlus = new ThreePlus('.canvas-container');
  threePlus.camera.position.set(0, 5, 12);
  threePlus.camera.lookAt(0, 2, 0);
  threePlus.control.target.set(0, 2, 0);

  threePlus.setLight(10);

  threePlus.addAxis3d();
  threePlus.addBar3d();
})

</script>

<style lang="less" scope>
.home {
  width: 1920px;
  height: 1080px;
  transform-origin: 0 0;
  background: #282828;
}

.canvas-container {
  width: 100%;
  height: 100%;
}
</style>