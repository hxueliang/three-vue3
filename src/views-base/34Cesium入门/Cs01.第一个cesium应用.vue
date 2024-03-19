<!-- Cs01.第一个cesium应用 -->
<!-- 在node_modules/cesium/Build/Cesium目录中 -->
<!-- 把Assets、ThirdParty、Widgets、Workers，复制到public下 -->
<!-- 把Widgets，复制到src下 -->
<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as Cesium from 'cesium';

import 'cesium/Build/Cesium/Widgets/widgets.css';

import { CESIUM_TOKEN } from '@/constant/cesium.js';

// 设置cesium静态资源路径
window.CESIUM_BASE_URL = '/';

// 设置token
Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;

const container = ref(null);

// 设置cesium默认视角在中国
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
  89.5, // 西边经度
  20.4, // 南边维度
  110.4, // 东边经度
  61.2, // 北边维度
);

onMounted(() => {
  const viwer = new Cesium.Viewer('container');

  // 隐藏cesium的logo
  viwer.cesiumWidget.creditContainer.style.display = 'none';
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