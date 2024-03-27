<!-- Cs33.3DTiles高级样式设置与条件渲染 -->
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

    // 设置iframe沙箱使用js
    const iframe = document.getElementsByClassName('cesium-infoBox-iframe')[0];
    iframe?.setAttribute(
      'sandbox',
      'allow-same-origin allow-scripts allow-popups allow-forms'
    );
    iframe?.setAttribute('src', '');

    // 添加3d建筑
    const tiles3d = await Cesium.createOsmBuildingsAsync();
    const osmBuildings = viewer.scene.primitives.add(tiles3d);
    // 广州塔
    const position = Cesium.Cartesian3.fromDegrees(113.3191, 23.109, 1000);

    viewer.camera.flyTo({
      destination: position,
      duration: 2,
    });

    // 条件判断
    tiles3d.style = new Cesium.Cesium3DTileStyle({
      defines: {
        distance111: 'distance(vec2(${feature["cesium#longitude"]}, ${feature["cesium#latitude"]}), vec2(113.3191, 23.109))'
      },
      color: {
        conditions: [
          ['${distance111} < 0.005', 'color("rgba(0, 0, 255, 0.5)")'],
          ['${distance111} < 0.02', 'color("rgba(100, 100, 255, 0.5)")'],
          ['${distance111} < 0.035', 'color("rgba(160, 160, 255, 0.5)")'],
          ['true', 'color("white")']
        ]
      },
      show: '${distance111} < 0.05',
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