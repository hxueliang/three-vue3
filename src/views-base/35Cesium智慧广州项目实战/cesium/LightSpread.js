import * as Cesium from 'cesium';
import gsap from 'gsap';
import LightSpreadMaterialProperty from "./material/LightSpreadMaterialProperty";

export default class LightSpread {
  constructor(viewer) {
    this.lightSpread = new LightSpreadMaterialProperty();

    this.params = {
      minlot: 113.304,
      minLat: 23.101,
      maxlot: 113.3095,
      maxLat: 23.106,
    };

    this.entity = viewer.entities.add({
      rectangle: {
        coordinates: Cesium.Rectangle.fromDegrees(
          113.304,
          23.101,
          113.3095,
          23.106
        ),
        material: this.lightSpread,
      },
    });

    gsap.to(this.params, {
      minlot: 113.304 - 0.5,
      minLat: 23.101 - 0.5,
      maxlot: 113.3095 + 0.5,
      maxLat: 23.106 + 0.5,
      duration: 5,
      repeat: -1,
      // yoyo: true,
      ease: "linear",
      onUpdate: () => {
        this.entity.rectangle.coordinates = Cesium.Rectangle.fromDegrees(
          this.params.minlot,
          this.params.minLat,
          this.params.maxlot,
          this.params.maxLat
        );
      },
    });
  }
}