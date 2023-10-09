import * as Cesium from 'cesium';
import gsap from "gsap";

export default class SpritelineMaterialProperty {
  constructor(typeName = 'SpritelineMaterial') {
    this.definitionChanged = new Cesium.Event();
    this.typeName = typeName;

    Cesium.Material._materialCache.addMaterial(this.typeName, {
      fabric: {
        type: this.typeName,
        uniforms: {
          uTime: 0,
          image: './texture/cesium/spriteline1.png',
        },
        source: `
          czm_material czm_getMaterial(czm_materialInput materialInput) {
            czm_material material = czm_getDefaultMaterial(materialInput);
            // 获取st
            vec2 st = materialInput.st;
            // 根据uv采样颜色
            vec4 color = texture2D(image, st); // 报错
            vec4 color = texture2D(image, vec2(fract(st.s-uTime) , st.t)); // 报错
            
            material.alpha = color.a;
            material.diffuse = color.rgb;
            
            return material;
          }
        `,
      }
    });

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
    result.uTime = this.params.uTime;
    return result;
  }

  // 满足接口要求，增加equals方法
  equals(other) {
    return other instanceof SpritelineMaterialProperty && this.typeName === other.typeName;
  }
}