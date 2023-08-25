<!-- 127.智慧城市 -->
<!-- 下载模型 https://cadmapper.com/pro/home -->
<!-- window 打开模型 Autodesk 3ds Max -->
<!-- mac 打开模型 Rhino -->
<template>
  <Scene></Scene>
  <Screen></Screen>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as THREE from 'three';

import Scene from '@/components/Scene.vue';
import Screen from '@/components/Screen.vue';

</script>

<style lang="less" scope></style>
<style>
body {
  background-color: #1e1a20;
}
</style>