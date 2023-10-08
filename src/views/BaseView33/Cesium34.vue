<!-- Cs34.制作获取地图经纬度插件 -->
<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import { onMounted } from 'vue';
import * as Cesium from 'cesium';

import initViewer from './cesium/initViewer';

onMounted(() => {
  const viewer = initViewer();
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