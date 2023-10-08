<!-- Cs35.指南罗盘与比例尺 -->
<!-- https://www.npmjs.com/package/cesium-navigation-es6 -->
<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import * as Cesium from 'cesium';

import initViewer from './cesium/initViewer';
import MousePosition from './cesium/MousePosition';

onMounted(async () => {
  const viewer = await initViewer();

  // 根据鼠标位置生成经纬度值
  const ousePosition = new MousePosition(viewer);
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