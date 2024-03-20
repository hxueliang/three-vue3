<!-- Cs04.坐标系与坐标系值转换 -->
<!-- 1、屏幕坐标系统，二维的笛卡尔坐标系，Cartesian2类型 -->
<!-- 2、地理坐标系统，WGS-84坐标系，Cartographic类型，经度，纬度，高度 -->
<!-- 3、笛卡尔空间直角坐标系，Cartesian3类型 -->
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

onMounted(() => {
  const viwer = new Cesium.Viewer('container', {
  });

  // 角度转弧度
  const radians = Cesium.Math.toRadians(90);
  console.log(radians, radians === Math.PI * 0.5);

  // 弧度转角度
  const degrees = Cesium.Math.toDegrees(2 * Math.PI);
  console.log(degrees);

  /**
   * 将经纬度转为笛卡尔坐标
   * longitude: number, 
   * latitude: number, 
   * height?: number, 
   * ellipsoid?: Cesium.Ellipsoid, 
   * result?: Cesium.Cartesian3
   */
  const cartesian3 = Cesium.Cartesian3.fromDegrees(89.5, 20.4, 100);
  console.log(cartesian3);

  // 将笛卡尔坐标转为经纬度
  const cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
  cartographic.longitude = Cesium.Math.toDegrees(cartographic.longitude);

  cartographic.latitude = Cesium.Math.toDegrees(cartographic.latitude);
  console.log(cartographic);
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