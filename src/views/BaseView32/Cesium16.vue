<!-- Cs16.entity关于线的材质 -->
<!-- https://cesium.com/learn/cesiumjs-learn/cesiumjs-creating-entities/#picking -->
<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as Cesium from 'cesium';

import 'cesium/Build/Cesium/Widgets/widgets.css';

import { CESIUM_TOKEN, TDT_TOKEN } from '@/constant/cesium.js';

const container = ref(null);

// 设置cesium静态资源路径
window.CESIUM_BASE_URL = '/';

// 设置token
Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;

// 设置cesium默认视角在中国
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
  89.5, // 西边经度
  20.4, // 南边维度
  110.4, // 东边经度
  61.2, // 北边维度
);

onMounted(async () => {
  const viewer = new Cesium.Viewer('container', {
    infoBox: false,
  });

  // 设置红色材质
  const material = Cesium.Color.RED;

  // 使用entities创建折线
  const redLine = viewer.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArray([
        90, // 西边经度
        20, // 南边维度
        100,
        22,
        100,
        29,
        110, // 东边经度
        30 // 北边维度
      ]),
      width: 5,
      material,
    },
  });

  viewer.camera.setView(viewer.entities);
})

</script>

<style lang="less" scope>
#container {
  width: 100vw;
  height: 100vh;
}
</style>
<style>
body {
  background-color: #1e1a20;
}
</style>