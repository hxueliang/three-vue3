<!-- Cs09.3D模型添加与设置 -->
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

  // 生成广州塔的位置
  const position = Cesium.Cartesian3.fromDegrees(113.3191, 23.109, 2000);

  viewer.camera.flyTo({
    destination: position,
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-90),
      roll: 0,
    }
  });

  // 添加3D建筑
  try {
    const tileset = await Cesium.createOsmBuildingsAsync({
      style: new Cesium.Cesium3DTileStyle({
        color: {
          conditions: [
            ["${feature['building']} === 'hospital'", "color('#0000FF')"],
            ["${feature['building']} === 'school'", "color('#00FF00')"],
            [true, "color('#ffffff')"]
          ]
        }
      })
    });
    viewer.scene.primitives.add(tileset);
  } catch (error) {
    console.log(`Error creating tileset: ${error}`);
  }

  // 添加3D模型
  const airplane = viewer.entities.add({
    name: 'Airplane',
    position: Cesium.Cartesian3.fromDegrees(113.3191, 23.109, 700),
    model: {
      uri: './model/cesium/airplane.gltf',
      minimumPixelSize: 64, // 飞机的最小像素
      silhouetteSize: 2, // 设置飞机的轮廓
      silhouetteColor: Cesium.Color.WHITE, // 轮廓的颜色
      // 相机离模型多远距离显示
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 200000)
    }
  });

  // 文字标签与广告牌
  const label = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(113.3191, 23.109, 200),
    label: {
      text: '广州塔',
      font: '24px sans-serif',
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -24), // 文字偏移量
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER, // 文字显示位置
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // 文字的显示位置
    },
  });

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