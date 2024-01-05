<!-- Cs31.3DTiles与性能监控 -->
<!-- https://github.com/CesiumGS/3d-tiles/tree/main/specification -->
<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as Cesium from 'cesium';

import 'cesium/Build/Cesium/Widgets/widgets.css';

import { CESIUM_TOKEN, TDT_TOKEN } from '@/constant/cesium.js';
import planeData from '@/assets/json/plane.json';

const container = ref(null);

// 设置cesium静态资源路径
window.CESIUM_BASE_URL = '/';

// 设置token
Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;

onMounted(async () => {
  let viewer;
  try {
    viewer = new Cesium.Viewer('container', {
      infoBox: false,
    });

    // 复制/Cesium-1.109/Specs/Data/Cesium3DTiles/Tilesets/Tileset
    // 所以资到/public/Assets
    const tileset = await Cesium.Cesium3DTileset.fromUrl(
      "./Assets/tileset.json"
    );
    console.log(tileset);

    viewer.scene.primitives.add(tileset);

    viewer.zoomTo(tileset);

    // 添加3DTiles调试面板，通过*Loggin*Performance查看内存
    viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
  } catch (err) {
    console.log(err);
  }
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