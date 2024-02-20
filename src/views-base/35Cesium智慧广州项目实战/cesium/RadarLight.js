import * as Cesium from "cesium";
import RadarMaterialProperty from "./material/RadarMaterialProperty";

export default class RadarLight {
  constructor(viewer) {
    this.radarMaterial = new RadarMaterialProperty();
    this.entity = viewer.entities.add({
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(
          113.324,
          23.101,
          113.3295,
          23.106
        ),
        material: this.radarMaterial,
      },
    });
  }
}