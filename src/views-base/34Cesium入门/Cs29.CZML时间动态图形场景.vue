<!-- Cs29.CZML时间动态图形场景 -->
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
    shouldAnimate: true, // 自动开始动画
  });

  // 红点起始位置
  const position = Cesium.Cartesian3.fromDegrees(103, 31, 150000 * 100);

  // setView瞬间到达指定位置、视角
  viewer.camera.setView({
    // 指定相机位置
    destination: position,
    // 指定相机视角
    orientation: {
      // 指定相机的朝向，即领航角（类似人左右转头），绕y轴旋转的角度
      heading: Cesium.Math.toRadians(0),
      // 指定相机的俯仰角，0竖直向上，-90竖直向下（类似人抬头点头），绕x轴旋转的角度
      pitch: Cesium.Math.toRadians(-90),
      // 指定相机的滚转角，即翻滚角（类似人的左右拉伸脖子），绕z轴旋转的角度
      roll: 0,
    }
  });

  // 定义czml数据
  const czml = [
    {
      id: "document",
      name: "CZML Point - Time Dynamic",
      version: "1.0",
    },
    {
      id: "point",
      // 物体在什么时间范围可用
      availability: "2012-08-04T16:00:00Z/2012-08-04T16:05:00Z",
      position: {
        // 设置物体的起始时间
        epoch: "2012-08-04T16:00:00Z",
        // 设置了4个维度，1维是时间(单位:秒)，2维是经度，3维是纬度，4维是高度
        cartographicDegrees: [
          0, 118, 20, 150000,
          10, 108, 44, 150000,
          20, 98, 18, 150000,
          30, 90, 52, 150000
        ],
      },
      point: {
        color: {
          rgba: [255, 255, 255, 128],
        },
        outlineColor: {
          rgba: [255, 0, 0, 128],
        },
        outlineWidth: 3,
        pixelSize: 15,
      },
    },
  ];

  // 加载czml数据
  const dataSourcePromise = Cesium.CzmlDataSource.load(czml);
  dataSourcePromise.then(dataSources => {
    viewer.dataSources.add(dataSources);
  });
  // viewer.zoomTo(dataSourcePromise);
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