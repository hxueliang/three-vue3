import * as Cesium from 'cesium';
import gsap from 'gsap';

export default class LightSpreadMaterialProperty {
  constructor(typeName = 'LightSpreadMaterial') {
    this.definitionChanged = new Cesium.Event();
    this.typeName = typeName;

    Cesium.Material._materialCache.addMaterial(this.typeName, {
      fabric: {
        type: this.typeName,
        uniforms: {
          uTime: 0,
          image: './texture/cesium/hexagon.png',
        },
        source: `
          czm_material czm_getMaterial(czm_materialInput materialInput) {
            czm_material material = czm_getDefaultMaterial(materialInput);

            // 获取st
            vec2 st = materialInput.st;
            
            // 根据uv采样颜色
            vec4 color = texture(image, st);
            material.diffuse = color.rgb;
            material.alpha = color.a;

            return material;
          }
        `,
      }
    });

    // 修改uTime，方法二-1：
    this.params = { uTime: 0 };
    gsap.to(this.params, {
      uTime: Math.PI * 2,
      duration: 1,
      repeat: -1,
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