<!-- Cs08.文字标签与广告牌 -->
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
  });

  // 生成广州塔的位置
  const position = Cesium.Cartesian3.fromDegrees(113.3191, 23.109, 2000);

  viewer.camera.flyTo({
    destination: position,
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    }
  });

  // 添加3D建筑
  try {
    const tileset = await Cesium.createOsmBuildingsAsync({
      style: new Cesium.Cesium3DTileStyle({
        color: {
          conditions: [
            ["${feature['building']} === 'hospital'", "color('#0000FF')"],
            ["${feature['building']} === 'school'", "color('#00FF00')"],
            [true, "color('#ffffff')"]
          ]
        }
      })
    });
    viewer.scene.primitives.add(tileset);
  } catch (error) {
    console.log(`Error creating tileset: ${error}`);
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