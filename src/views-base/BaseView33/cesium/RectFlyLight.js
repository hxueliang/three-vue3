import * as Cesium from "cesium";
import * as turf from '@turf/turf';

import PolylineTrailMaterialProperty from './material/PolylineTrailMaterialProperty';

export default class RectFlyLight {
  constructor(viewer) {
    // 设置矩形区域
    this.bbox = [113.2691, 23.05, 113.3691, 23.16];
    // 这区域内,创建300个随机点
    const points = turf.randomPoint(300, { bbox: this.bbox });

    // 创建公共的自定义线材质
    let polylineTrailMaterialProperty = new PolylineTrailMaterialProperty();

    // 通过生成的点，生成随机的线
    points.features.forEach((item) => {
      // 获取点的经纬度
      const [longitude, latitude] = item.geometry.coordinates;

      // 设置起始、结束位置
      const start = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0);
      const endHeight = 200 + Math.random() * 300;
      const end = Cesium.Cartesian3.fromDegrees(longitude, latitude, endHeight);

      // 创建线
      const flyLine = viewer.entities.add({
        polyline: {
          positions: [start, end],
          width: 2,
          material: polylineTrailMaterialProperty,
        }
      });
    });
  }
}