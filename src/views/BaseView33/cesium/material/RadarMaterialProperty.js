import * as Cesium from 'cesium';
import gsap from "gsap";

export default class RadarMaterialProperty {
  constructor(typeName = 'RadarMaterial') {
    this.definitionChanged = new Cesium.Event();
    this.typeName = typeName;

    Cesium.Material._materialCache.addMaterial(this.typeName, {
      fabric: {
        type: this.typeName,
        uniforms: {
          uTime: 0,
        },
        source: `
          czm_material czm_getMaterial(czm_materialInput materialInput) {
            czm_material material = czm_getDefaultMaterial(materialInput);

            // 旋转uv
            vec2 newSt = mat2(
              cos(uTime), -sin(uTime),
              sin(uTime), cos(uTime)
            ) * (materialInput.st - 0.5) + 0.5;

            // 获取st
            // vec2 st = materialInput.st;
            vec2 st = newSt;
            
            // 设置圆，外部透明，内部不透明
            float alpha = 1.0 - step(0.5, distance(vec2(0.5), st));

            // 按照角度来设置强弱
            float angle = atan(st.x - 0.5, st.y - 0.5);
            // 角度angle是从-pi到pi的,需要0~1,要加上pi
            float strength = (angle + 3.1416) / 6.2832;

            // 将强弱与透明度结合
            alpha = alpha * strength;
            material.alpha = alpha;
            material.diffuse = vec3(st.x, st.y, 1.0);

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