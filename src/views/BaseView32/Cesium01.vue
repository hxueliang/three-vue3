<!-- Cs01.第一个cesium应用 -->
<!-- 在node_modules/cesium/Build/Cesium目录中 -->
<!-- 把Assets、ThirdParty、Widgets、Workers，复制到public下 -->
<!-- 把Widgets，复制到public下 -->
<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const container = ref(null);

onMounted(() => {
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