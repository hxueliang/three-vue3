<!-- Cs30.追踪航班跨洋飞行 -->
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
      shouldAnimate: true, // 自动开始动画
      terrainProvider: await Cesium.createWorldTerrainAsync({
        // 添加水纹
        requestWaterMask: true,
        requestVertexNormals: true
      })
    });

    // 添加3D建筑
    const osmBuildings = viewer.scene.primitives.add(
      await Cesium.createOsmBuildingsAsync()
    );

    // 时间间隔为30秒
    const timeStepInSeconds = 30;
    // 整个飞行花费的时间
    const totalSeconds = (planeData.length - 1) * timeStepInSeconds;
    // 设置起点时间
    const time = new Date('2023-10-01 22:10:49');
    // 因为cesium，默认使用的是儒略日时间
    // 将time转为儒略日时间
    const startJulianDate = Cesium.JulianDate.fromDate(time);
    const stopJulianDate = Cesium.JulianDate.addSeconds(
      startJulianDate, // 开始时间
      totalSeconds, // 花费的时间
      new Cesium.JulianDate() // 通过上面两个时间，创建新的时间，赋值到新对象上，不修改原对象
    );

    // 将查看器的时间调整到起点和结束点的范围
    viewer.clock.startTime = startJulianDate.clone();
    viewer.clock.stopTime = stopJulianDate.clone();
    viewer.clock.currentTime = startJulianDate.clone(); // 当前时间，默认为开始时间点

    // 将时间轴的时间调整到起点和结束点的范围
    viewer.timeline.zoomTo(startJulianDate, stopJulianDate);

    // 拿到轨迹
    const positionProperty = new Cesium.SampledPositionProperty();
    let planeEntity;
    planeData.forEach((pointData, i) => {
      const { longitude, latitude, height } = pointData;
      // 得到当前点的时间
      const time = Cesium.JulianDate.addSeconds(
        startJulianDate,
        i * timeStepInSeconds,
        new Cesium.JulianDate()
      );
      // 设置当前点的位置
      const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
      // 添加轨迹的采样点
      positionProperty.addSample(time, position);
      /* #region // 测试代码，查看轨迹
      viewer.entities.add({
        position,
        point: {
          pixelSize: 10,
          color: Cesium.Color.RED,
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
        }
      });
      // #endregion */

      // 创建飞机
      planeEntity = viewer.entities.add({
        name: '飞机',
        // 飞机在什么时间范围可用
        availability: new Cesium.TimeIntervalCollection([
          new Cesium.TimeInterval({
            start: startJulianDate,
            stop: stopJulianDate,
          })
        ]),
        position: positionProperty,
        // VelocityOrientationProperty，会自动根据采样点，计算出飞机的速度和方向
        orientation: new Cesium.VelocityOrientationProperty(positionProperty),
        model: {
          uri: './model/cesium/Cesium_Air.glb',
          minimumPixelSize: 64,
          maximumScale: 20000,
        },
        // 绘制轨迹线
        path: new Cesium.PathGraphics({
          width: 3,
        }),
      });

      // 相机追踪运动的物体
      viewer.trackedEntity = planeEntity;

      // 设置时间速率
      viewer.clock.multiplier = 240;
    });

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