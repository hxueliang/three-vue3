<!-- Cs05.相机的方向和位置 -->
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
  const viewer = new Cesium.Viewer('container', {
  });

  // 生成天安门的位置
  const position = Cesium.Cartesian3.fromDegrees(116.391, 39.901, 1000);

  // setView瞬间到达指定位置、视角
  viewer.camera.setView({
    // 指定相机位置
    destination: position,
    // 指定相机视角
    orientation: {
      // 指定相机的朝向，即领航角（类似人左右转头），绕y轴旋转的角度
      heading: Cesium.Math.toRadians(0),
      // 指定相机的俯仰角，0竖直向上，-90竖直向下（类似人抬头点头），绕x轴旋转的角度
      pitch: Cesium.Math.toRadians(-30),
      // 指定相机的滚转角，即翻滚角（类似人的左右拉伸脖子），绕z轴旋转的角度
      roll: 0,
    }
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