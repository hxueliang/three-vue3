<!-- Cs06.相机动画与相机动态交互 -->
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

onMounted(() => {
  const viewer = new Cesium.Viewer('container', {
  });

  // 生成天安门的位置
  const position = Cesium.Cartesian3.fromDegrees(116.391, 39.901, 1000);

  // flyTo让相机飞往某个地方
  viewer.camera.flyTo({
    destination: position,
    // 指定相机视角
    orientation: {
      // 指定相机的朝向，即领航角，
      heading: Cesium.Math.toRadians(0),
      // 指定相机的俯仰角，0竖直向上，-90竖直向下
      pitch: Cesium.Math.toRadians(-30),
      // 指定相机的滚转角，即翻滚角，
      roll: 0,
    }
  });

  // 移动
  const MOVE_KEY = {
    w: 'moveForward', // 设置相机向前移动
    s: 'moveBackward', // 设置相机向后移动
    a: 'moveLeft', // 设置相机向左移动
    d: 'moveRight', // 设置相机向右移动
  };

  // 旋转
  const LOOK_KEY = {
    q: 'lookLeft', // 设置相机向左旋转
    e: 'lookRight', // 设置相机向右旋转
    r: 'lookUp', // 设置相机向上旋转
    f: 'lookDown', // 设置相机向下旋转
  };

  // 翻滚
  const TWIST_KEY = {
    g: 'twistLeft', // 相机向左逆时针秋游，视觉效果：画布向右顺时针翻滚
    h: 'twistRight', // 相机向右顺时针翻滚，视觉效果：画布向左逆时针秋游
  };

  // 自动移动
  const AUTO_KEY = {
    ArrowUp: 'moveForward', // 相机向前移动
    ArrowDown: 'moveBackward', // 相机向后移动
    ArrowLeft: 'moveLeft', // 相机向左移动
    ArrowRight: 'moveRight', // 相机向右移动
  };

  let timer = null;

  // 通过按键移动相机
  document.addEventListener('keydown', e => {
    const { key } = e;
    if (key in MOVE_KEY) {
      // 获取相机离地面的高度
      const height = viewer.camera.positionCartographic.height;
      const moveRate = height / 10;
      viewer.camera[MOVE_KEY[key]](moveRate);
    } else if (key in LOOK_KEY) {
      viewer.camera[LOOK_KEY[key]](Cesium.Math.toRadians(0.1));
    } else if (key in TWIST_KEY) {
      viewer.camera[TWIST_KEY[key]](Cesium.Math.toRadians(0.1));
    } else if (key in AUTO_KEY) {
      clearInterval(timer);
      timer = setInterval(() => {
        const height = viewer.camera.positionCartographic.height;
        const moveRate = height / 10;
        viewer.camera[AUTO_KEY[key]](moveRate);
      }, 50);
    } else if (key === 'Escape') {
      clearInterval(timer);
    }
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