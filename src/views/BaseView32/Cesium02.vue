<!-- Cs02.详解查看器viwer，隐藏页面按钮 -->
<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as Cesium from 'cesium';

import 'cesium/Build/Cesium/Widgets/widgets.css';

import { CESIUM_TOKEN } from '@/constant/cesium.js';

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
    geocoder: false, // 不显示搜索按钮
    homeButton: false, // 不显示home按钮
    sceneModePicker: false, // 不显示场景模式选择按钮
    baseLayerPicker: false, // 不显示图层选择按钮
    navigationHelpButton: false, // 不显示帮助按钮
    animation: false, // 不显示动画控制器
    timeline: false, // 不显示时间轴
    fullscreenButton: false, // 不显示全屏按钮
  });

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