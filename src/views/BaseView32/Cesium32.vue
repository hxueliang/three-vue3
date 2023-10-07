<!-- Cs32.根据不同的条件设置3DTiles样式 -->
<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as Cesium from 'cesium';

import 'cesium/Build/Cesium/Widgets/widgets.css';

import { CESIUM_TOKEN, TDT_TOKEN } from '@/constant/cesium.js';
import planeData from '@/assets/json/plane.json';

const container = ref(null);

// 设置cesium静态资源路径
window.CESIUM_BASE_URL = '/';

// 设置token
Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;

onMounted(async () => {
  let viewer;
  try {
    viewer = new Cesium.Viewer('container', {
      // infoBox: false,
    });

    // 添加3d建筑
    const tiles3d = await Cesium.createOsmBuildingsAsync();
    const osmBuildings = viewer.scene.primitives.add(tiles3d);
    // 广州塔
    const position = Cesium.Cartesian3.fromDegrees(113.3191, 23.109, 1000);

    viewer.camera.flyTo({
      destination: position,
      duration: 2,
    });

    // 修改建筑物体颜色
    // tiles3d.style = new Cesium.Cesium3DTileStyle({
    //   // color: 'color("yellow")',
    //   color: 'rgba(255, 255, 0, 0.5)',
    //   show: true,
    // });

    // 条件判断
    tiles3d.style = new Cesium.Cesium3DTileStyle({
      color: {
        conditions: [
          ['${feature["cesium#estimatedHeight"]} >= 550', 'color("rgba(5, 5, 255, 0.8)")'],
          ['${feature["cesium#estimatedHeight"]} >= 500', 'color("rgba(60, 60, 255, 0.8)")'],
          ['${feature["cesium#estimatedHeight"]} >= 400', 'color("rgba(100, 100, 255, 0.8)")'],
          ['${feature["cesium#estimatedHeight"]} >= 300', 'color("rgba(140, 140, 255, 0.8)")'],
          // ['${feature["name"]} === "中信广场"', 'color("blue", 0.7)'],
          ['${feature["building"]} === "apartments"', 'color("rgba(64, 196, 99, 0.5)")'],
          ['${feature["building"]} === "office"', 'color("purple", 0.7)'],
          ['${feature["building"]} === "yes"', 'color("orange", 0.7)'],
          ['${feature["building"]} === "commercial"', 'color("pink", 0.6)'],
          ['${feature["building"]} === "industrial"', 'color("black", 0.8)'],
          ['true', 'color("white")']
        ]
      },
      show: true,
    });



  } catch (err) {
    console.log(err);
  }
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