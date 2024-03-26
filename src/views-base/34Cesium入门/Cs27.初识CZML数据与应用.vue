<!-- Cs27.初识CZML数据与应用 -->
<!-- 说明文档 https://github.com/AnalyticalGraphicsInc/czml-writer/wiki/CZML-Guide -->
<!-- 案例 http://localhost:8080/Apps/Sandcastle/index.html 搜索czml -->
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

  // 定义czml数据
  const czml = [
    {
      id: "document",
      name: "box",
      version: "1.0",
    },
    {
      id: "shape1",
      name: "Blue box",
      position: {
        cartographicDegrees: [118.0, 30.0, 300000.0],
      },
      box: {
        dimensions: {
          cartesian: [400000.0, 300000.0, 500000.0],
        },
        // fill: false,
        outline: true,
        outlineColor: {
          rgba: [255, 255, 0, 255],
        },
        material: {
          solidColor: {
            color: {
              rgba: [0, 0, 255, 255],
            },
          },
        },
      },
    },
  ];

  // console.log(JSON.stringify(czml)); // 组Cs28.加载czml格式数据用

  // 加载czml数据
  const dataSourcePromise = Cesium.CzmlDataSource.load(czml);
  dataSourcePromise.then(dataSources => {
    viewer.dataSources.add(dataSources);
  });
  viewer.zoomTo(dataSourcePromise);
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