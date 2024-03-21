<!-- Cs02.详解查看器viwer，隐藏页面按钮 -->
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
  const viwer = new Cesium.Viewer('container', {
    infoBox: false, // 隐藏信息框 (Blocked script execution in 'about:blank' because the document's frame is sandboxed and the 'allow-scripts' permission is not set.)
    geocoder: false, // 不显示搜索按钮
    homeButton: false, // 不显示home按钮
    sceneModePicker: false, // 不显示场景模式选择按钮
    baseLayerPicker: false, // 不显示图层选择按钮
    navigationHelpButton: false, // 不显示帮助按钮
    animation: false, // 不显示动画控制器
    timeline: false, // 不显示时间轴
    fullscreenButton: false, // 不显示全屏按钮
    // 设置天空盒
    skyBox: new Cesium.SkyBox({
      positiveX: './textures/city/night_1.jpg',
      negativeX: './textures/city/night_2.jpg',
      positiveY: './textures/city/night_3.jpg',
      negativeY: './textures/city/night_4.jpg',
      positiveZ: './textures/city/night_5.jpg',
      negativeZ: './textures/city/night_6.jpg',
    }),

    // 语法一：设置viwer.imageryProvider

    /*
    // 设置天地图矢量路径图
    imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
      url: `http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${TDT_TOKEN}`,
      layer: "tdtBasicLayer",
      style: "default",
      format: "image/jpeg",
      tileMatrixSetID: "GoogleMapsCompatible",
    }),
    // */

    /*
    // OSM地图影像地图
    imageryProvider: new Cesium.OpenStreetMapImageryProvider({
      url: 'https://a.tile.openstreetmap.org/',
    }),
    // */

    /*
    // 高德矢量地图
    imageryProvider: new Cesium.UrlTemplateImageryProvider({
      url: `http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style={x}&y={y}&z{z}`,
      layer: "tdtBasicLayer",
      style: "default",
      format: "image/jpeg",
      tileMatrixSetID: "GoogleMapsCompatible",
    })
    // */
  });


  // 语法二：设置viwer.imageryLayers.addImageryProvider

  // 设置天地图 参考 https://blog.csdn.net/u012425087/article/details/129909012

  /*
  // 天地图 矢量底图
  viwer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
    url: `http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${TDT_TOKEN}`,
    layer: 'tdtVecBasicLayer',
    style: 'default',
    format: 'image/jpeg',
    tileMatrixSetID: 'GoogleMapsCompatible',
  }));
  // */

  /*
  // 天地图 矢量注记
  viwer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
    url: `http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=${TDT_TOKEN}`,
    layer: 'tdtAnnoLayer',
    style: 'default',
    format: 'image/jpeg',
    tileMatrixSetID: 'GoogleMapsCompatible'
  }));
  // */

  // /*
  // 天地图 影像底图
  viwer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
    url: `http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=${TDT_TOKEN}`,
    layer: 'tdtBasicLayer',
    style: 'default',
    format: 'image/jpeg',
    tileMatrixSetID: 'GoogleMapsCompatible',
  }));
  // */

  /*
  // 天地图 影像注记
  viwer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
    url: `http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=${TDT_TOKEN}`,
    layer: 'tdtAnnoLayer',
    style: 'default',
    format: 'image/jpeg',
    tileMatrixSetID: 'GoogleMapsCompatible',
  }));
  // */

  /*
  // 添加OSM地图影像
  const osm = new Cesium.OpenStreetMapImageryProvider({
    url: 'https://a.tile.openstreetmap.org/'
  });
  viwer.imageryLayers.addImageryProvider(osm);
  // */

  /*
  // 添加高德矢量图
  let atLayer = new Cesium.UrlTemplateImageryProvider({
    // url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    url: "http://webst03.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&style=7",
    minimumLevel: 3,
    maximumLevel: 18,
  });
  viwer.imageryLayers.addImageryProvider(atLayer);
  // */

  // 隐藏cesium的logo
  viwer.cesiumWidget.creditContainer.style.display = 'none';
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