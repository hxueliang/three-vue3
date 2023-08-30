<!-- 128.智慧园区 -->
<template>
  <Scene></Scene>
  <Screen :dataInfo="dataInfo"></Screen>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import * as THREE from 'three';
import { gsap } from 'gsap';

import Scene from './components/Scene.vue';
import Screen from './components/Screen.vue';

const dataInfo = ref([
  {
    name: '热气球环绕',
    number: 1,
    unit: '个'
  }
]);

onMounted(async () => {
});

</script>

<style lang="less" scope></style>
<style>
body {
  background-color: #1e1a20;
}
</style>