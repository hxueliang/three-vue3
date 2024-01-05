import * as Cesium from 'cesium';
import gsap from 'gsap';
import LightWallMaterialProperty from "./material/LightWallMaterialProperty";

export default class LightWall {
  constructor(viewer) {
    this.lightWall = new LightWallMaterialProperty();

    this.params = {
      minlot: 113.304,
      minLat: 23.101,
      maxlot: 113.3095,
      maxLat: 23.106,
    };

    this.entity = viewer.entities.add({
      name: "LightWall",
      wall: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          113.304, 23.115, 200.0,
          113.304 + 0.01, 23.115, 200.0,

          113.304 + 0.01, 23.115 + 0.01, 200.0,
          113.304, 23.115 + 0.01, 200.0,

          113.304, 23.115, 200.0,
        ]),
        material: this.lightWall,
      },
    });

    // gsap.to(this.params, {
    //   minlot: 113.304 - 0.05,
    //   minLat: 23.101 - 0.05,
    //   maxlot: 113.3095 + 0.05,
    //   maxLat: 23.106 + 0.05,
    //   duration: 5,
    //   repeat: -1,
    //   // yoyo: true,
    //   ease: "linear",
    //   onUpdate: () => {
    //     this.entity.rectangle.coordinates = Cesium.Rectangle.fromDegrees(
    //       this.params.minlot,
    //       this.params.minLat,
    //       this.params.maxlot,
    //       this.params.maxLat
    //     );
    //   },
    // });
  }
}