<!-- Cs42.六边形光波扩散特效 -->
<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import * as Cesium from 'cesium';
import CesiumNavigation from 'cesium-navigation-es6';

import initViewer from './cesium/initViewer';
import MousePosition from './cesium/MousePosition';
import modifyMap from './cesium/modifyMap';
import modifyBuild from './cesium/modifyBuild';
import LightCone from './cesium/LightCone';
import RectFlyLight from './cesium/RectFlyLight';
import RoadLightLine from './cesium/RoadLightLine';
import RadarLight from './cesium/RadarLight';

onMounted(async () => {
  const viewer = await initViewer();

  // 根据鼠标位置生成经纬度值
  const ousePosition = new MousePosition(viewer);

  // 初始化导航罗盘
  const navigation = new CesiumNavigation(viewer, {
    enableCompass: true, // 启用罗盘控件
    enableZoomControls: true, // 启用缩放控件
    enableDistanceLegend: true, // 启用距离图例
    enableCompassOuterRing: true, // 启用指南针外环
  });

  // 修改地图的底色
  modifyMap(viewer);

  // 修改建筑物颜色
  modifyBuild(viewer);

  // 添加动态的光锥特效
  const lightCone = new LightCone(viewer);

  // 添加区域上升流光飞线
  const rectFlyLight = new RectFlyLight(viewer);

  // 添加路径流光线
  const roadLightLine = new RoadLightLine(viewer);

  // 添加雷达
  const radarLight = new RadarLight(viewer);
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