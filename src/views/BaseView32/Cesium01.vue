<!-- Cs01.第一个cesium应用 -->
<!-- 在node_modules/cesium/Build/Cesium目录中 -->
<!-- 把Assets、ThirdParty、Widgets、Workers，复制到public下 -->
<!-- 把Widgets，复制到public下 -->
<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as Cesium from 'cesium';

import 'cesium/Build/Cesium/Widgets/widgets.css';

// 设置cesium静态资源路径
window.CESIUM_BASE_URL = '/';

const container = ref(null);

onMounted(() => {
  const viwer = new Cesium.Viewer('container');
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