import * as Cesium from 'cesium';
import gsap from "gsap";

export default class PolylineTrailMaterialProperty {
  constructor(
    typeName = 'PolylineTrailMaterial',
    color = new Cesium.Color(0.7, 0.7, 1.0, 1.0),
  ) {
    this.definitionChanged = new Cesium.Event();
    this.typeName = typeName;

    Cesium.Material._materialCache.addMaterial(this.typeName, {
      fabric: {
        type: this.typeName,
        uniforms: {
          uTime: 0,
          color: color,
        },
        source: `
          czm_material czm_getMaterial(czm_materialInput materialInput) {
            czm_material material = czm_getDefaultMaterial(materialInput);
            // 获取st
            vec2 st = materialInput.st;
            // 获取当前帧数, 5秒内变化从0~1
            float time = fract(czm_frameNumber / (60.0 * 5.0));
            time = time * (1.0 + 0.1);

            // 平滑过渡函数
            // smoothstep(edge1, edge2, value);
            // eg: 
            // smoothstep(4, 6, 3) == 0
            // smoothstep(4, 6, 7) == 1
            // smoothstep(4, 6, 5) == 0.5

            float alpha = smoothstep(time - 0.15, time, st.s) * step(-time, -st.s);
            alpha += 0.1;
            material.alpha = alpha;
            material.diffuse = color.rgb;
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

  // 满足接口要求，增加equals方法
  equals(other) {
    return other instanceof PolylineTrailMaterialProperty && this.typeName === other.typeName;
  }
}