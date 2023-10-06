<!-- Cs22.编写自定义MaterialProperty材质 -->
<template>
  <div id="container" ref="container"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as Cesium from 'cesium';
import gsap from 'gsap';

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

  class CustomMaterialProperty {
    constructor() {
      this.definitionChanged = new Cesium.Event();
      this.typeName = 'CustomMaterial';

      Cesium.Material._materialCache.addMaterial(this.typeName, {
        fabric: {
          type: this.typeName,
          uniforms: {
            uTime: 0,
          },
          source: `
            czm_material czm_getMaterial(czm_materialInput materialInput) {
              czm_material material = czm_getDefaultMaterial(materialInput);
              material.diffuse = vec3(materialInput.st, uTime);
              return material;
            }
          `,
        }
      });

      // 修改uTime，方法二-1：
      this.params = { uTime: 0 };
      gsap.to(this.params, {
        uTime: 1,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'linear',
      });
    }

    // 获取材质类型
    getType() {
      return this.typeName;
    }

    // 获取value, 本质是要传给uniforms
    getValue(time, result) {
      /*
      // 修改uTime方法一：
      let t = performance.now() / 1000;
      t %= 1;
      result.uTime = t;
      */

      // 修改uTime方法二-2：
      result.uTime = this.params.uTime;
      return result;
    }
  }

  const material = new CustomMaterialProperty();

  // 使用entities创建矩形
  const rectangle = viewer.entities.add({
    rectangle: {
      coordinates: Cesium.Rectangle.fromDegrees(
        90, // 西边经度
        20, // 南边维度
        110, // 东边经度
        30 // 北边维度
      ),
      material,
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