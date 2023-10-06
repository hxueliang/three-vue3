<!-- Cs20.cesium着色器自带函数与变量 -->
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

  // 使用entities创建矩形
  const rectangle = viewer.entities.add({
    rectangle: {
      coordinates: Cesium.Rectangle.fromDegrees(
        90, // 西边经度
        20, // 南边维度
        110, // 东边经度
        30 // 北边维度
      ),
      material: Cesium.Color.RED.withAlpha(0.5),
    }
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
    vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
  });
  // 1.1 创建几何体2
  const rectGeometry2 = new Cesium.RectangleGeometry({
    rectangle: Cesium.Rectangle.fromDegrees(
      150, // 西边经度
      20, // 南边维度
      170, // 东边经度
      30 // 北边维度
    ),
    height: 0, // 距离表面高度
    extrudedHeight: 0, // 挤出高度
    vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
  });

  // 2 创建几何体实例
  const geoInstance = new Cesium.GeometryInstance({
    id: 'redRect',
    geometry: rectGeometry,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(
        Cesium.Color.RED.withAlpha(0.5)
      )
    }
  });
  // 2.1 创建几何体实例2
  const geoInstance2 = new Cesium.GeometryInstance({
    id: 'blueRect',
    geometry: rectGeometry2,
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(
        Cesium.Color.BLUE.withAlpha(0.5)
      )
    }
  });

  // 使用fabric选项编写着色器材质
  const material1 = new Cesium.Material({
    fabric: {
      uniforms: {
      },
      source: `
        czm_material czm_getMaterial(czm_materialInput materialInput) {
          czm_material material = czm_getDefaultMaterial(materialInput);
          material.diffuse = vec3(1.0, 0.0, 0.0);
          return material;
        }
      `,
    }
  });

  // 3 设置外观，即材质
  const appearance = new Cesium.EllipsoidSurfaceAppearance({
    material: material1,
  });

  // 4 创建图元，即物体
  const primitive = new Cesium.Primitive({
    geometryInstances: [geoInstance, geoInstance2],
    appearance,
  });

  // 5 添加到viewer的场景中
  viewer.scene.primitives.add(primitive);

  // 拾取
  // new Cesium.ScreenSpaceEventHandler(element),处理用户输入事件。可以添加自定义函数，以便在用户输入时执行。
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction(movement => {
    // viewer.scene.pick,选中物体
    const pickedObject = viewer.scene.pick(movement.position);
    if (!Cesium.defined(pickedObject)) { return; }
    if (typeof pickedObject.id === 'string') {
      const attributes = primitive.getGeometryInstanceAttributes(pickedObject.id);
      attributes.color = Cesium.ColorGeometryInstanceAttribute.toValue(
        Cesium.Color.fromRandom({ // 改为随机颜色
          alpha: 0.5
        })
      );
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
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