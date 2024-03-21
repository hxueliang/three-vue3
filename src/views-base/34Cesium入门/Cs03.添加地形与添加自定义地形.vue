<!-- Cs03.添加地形与添加自定义地形 -->
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
  const viwer = new Cesium.Viewer('container', {
    // /*
    // 设置自定义地形
    // 1、获取地形数据：https://www.gscloud.cn/
    // 1.1、网页导航：平台首页/公开数据/DEM 数字高程数据/GDEMV3 30M 分辨率数字高程数据，搜索经度115.5，搜到广州地形数据
    // 1.2、输入经纬度，下载需要的地形

    // 2、打开：cesiumlab.com
    // 2.1、网页导航：产品/CesiumLab地理信息基础数据处理平台/立即下载
    // 2.2、安装：win系统安装/点图标启动CesiumLab3
    // 2.3、打开：http://localhost:9003/index.html#/data/guide
    // 2.4、登录：用户名：135  密码：59c
    // 2.5、网页导航：地形切片/添加文件/选择1.2下载的地形文件/三角算法(选vcg)/存储类型(选散列)/设置输出路径/点提交处理
    // 2.6、将处理好的文件放到public目录下(有.tmp临时文件可以删除)

    // 3、加载自定义地形数据 广州的数据
    terrainProvider: await Cesium.CesiumTerrainProvider.fromUrl('./terrains/gz')
    // */

    /*
    terrainProvider: new Cesium.CesiumTerrainProvider({
      url: './terrains/gz'
    })
    // */
  });

  // viwer.terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl('./terrains/gz');

  /*
  // 设置cesium自带的地形 全量数据
  viwer.terrainProvider = await Cesium.createWorldTerrainAsync({
    requestVertexNormals: true, // 顶点法线，添加阴影
    requestWaterMask: true, // 添加水纹
  });
  // */
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