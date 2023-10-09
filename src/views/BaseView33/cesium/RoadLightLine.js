import * as Cesium from 'cesium';
import PolylineTrailMaterialProperty from './material/PolylineTrailMaterialProperty';

export default class RoadLightLine {
  constructor(viewer) {
    const geoJsonPromise = Cesium.GeoJsonDataSource.load('./geojson/roadline2.geojson');

    geoJsonPromise.then(dataSource => {
      // 把线加入地图
      viewer.dataSources.add(dataSource);
      const polylineTrailMaterialProperty = new PolylineTrailMaterialProperty(
        'RoadLightLine',
        new Cesium.Color(0.3, 0.9, 0.9, 1.0)
      );
      const entities = dataSource.entities.values;
      entities.forEach(item => {
        const { polyline } = item;
        polyline.material = polylineTrailMaterialProperty;
      });
    });
  }
}