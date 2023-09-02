<!-- 130.智慧工厂 -->
<template>
  <Scene></Scene>
  <Screen></Screen>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import * as THREE from 'three';
import { gsap } from 'gsap';

import Scene from './components/Scene.vue';
import Screen from './components/Screen.vue';

onMounted(async () => {
});

</script>

<style lang="less" scope></style>
<style>
body {
  background-color: #1e1a20;
}
</style>