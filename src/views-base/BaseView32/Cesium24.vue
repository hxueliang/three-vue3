<!-- Cs24.自定义GEOJSON生成物体的样式 -->
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

  // 在阿里地理数据可视化平台
  // https://datav.aliyun.com/portal/school/atlas/area_selector
  // 获取.json地址
  const dataGeo = Cesium.GeoJsonDataSource.load('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json', {
    stroke: Cesium.Color.RED,
    fill: Cesium.Color.PINK.withAlpha(0.4),
    strokeWidth: 3,
    markerSymbol: '?'
  });
  /*
  // 地理信息添加到地图，方法一：
  console.log(dataGeo);
  viewer.dataSources.add(dataGeo);
  */

  // 地理信息添加到地图，方法二：
  dataGeo.then(dataSources => {
    console.log(dataSources);
    viewer.dataSources.add(dataSources);
    const { values: entities } = dataSources.entities;
    entities.forEach((entity, i) => {
      // 设置随机颜色
      entity.polygon.material = new Cesium.ColorMaterialProperty(
        Cesium.Color.fromRandom({
          alpha: 1,
        })
      );
      // 取消边框
      entity.polygon.outline = false;
      // 挤出随机高度
      const randomNum = parseInt(Math.random() * 5);
      entity.polygon.extrudedHeight = 100000 * randomNum;
    });
  });
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