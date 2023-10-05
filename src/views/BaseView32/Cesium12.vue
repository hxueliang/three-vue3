<!-- Cs12.primivite一个图元，创建多个物体 -->
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

onMounted(async () => {
  const viewer = new Cesium.Viewer('container', {
  });

  // 使用primivite创建矩形
  // 1 创建几何体
  const rectGeometry = new Cesium.RectangleGeometry({
    rectangle: Cesium.Rectangle.fromDegrees(
      120, // 西边经度
      20, // 南边维度
      140, // 东边经度
      30 // 北边维度
    ),
    height: 0, // 距离表面高度
    extrudedHeight: 0, // 挤出高度
    vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT, // 要计算的顶点属性
  });

  // 2 创建几何体实例
  const geoInstance = new Cesium.GeometryInstance({
    geometry: rectGeometry,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(
        Cesium.Color.RED.withAlpha(0.5)
      )
    }
  });

  // 3 设置外观，即材质
  const appearance = new Cesium.PerInstanceColorAppearance({
    flat: true,
  });

  // 4 创建图元，即物体
  const primitive = new Cesium.Primitive({
    geometryInstances: geoInstance,
    appearance,
  });

  // 5 添加到viewer的场景中
  viewer.scene.primitives.add(primitive);

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