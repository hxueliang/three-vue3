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
  // threePlus.addBar3d();
  // threePlus.addPie3d();

  const dataExamples1 = [
    { value: 2.5, name: "星期一", type: "亿台" },
    { value: 1.7, name: "星期二", type: "万台" },
    { value: 2.0, name: "星期三", type: "万台" },
    { value: 1.5, name: "星期四", type: "万台" },
    { value: 2.2, name: "星期五", type: "万台" },
    { value: 2.6, name: "星期六", type: "万台" },
    { value: 1.0, name: "星期日", type: "万台" },
  ];
  let dataExamples2 = [
    { value: 3.5, name: "星期一", type: "万台" },
    { value: 2.7, name: "星期二", type: "万台" },
    { value: 3.0, name: "星期三", type: "万台" },
    { value: 2.5, name: "星期四", type: "万台" },
    { value: 3.2, name: "星期五", type: "万台" },
    { value: 3.6, name: "星期六", type: "万台" },
    { value: 2.0, name: "星期日", type: "万台" },
  ];
  const plane1 = threePlus.addPolyline3d(dataExamples1);
  const plane2 = threePlus.addPolyline3d(dataExamples2);
  // plane1.mesh.position.z = 1;
  plane2.mesh.position.z = -1;
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