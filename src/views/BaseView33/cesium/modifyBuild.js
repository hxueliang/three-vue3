import * as Cesium from 'cesium';

export default async function modifyBuild(viewer) {
  // 添加3d建筑
  const tiles3d = await Cesium.createOsmBuildingsAsync();
  const osmBuildings = viewer.scene.primitives.add(tiles3d);

  // 设置自定义着色器
  tiles3d.customShader = new Cesium.CustomShader({
    // 设置片元着色器
    fragmentShaderText: `
      void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
        // 根据z坐标设置强度
        float strength = fsInput.attributes.positionMC.z / 300.0;
        // 粉色
        material.diffuse = vec3(strength, 0.3 * strength, strength);

        // 设置动态光环
        // czm_frameNumber: 获取当前帧数
        // fract(x): 返回x的小数部分
        // clamp(x, min, max): 返回x在min和max之间的最小值
        // step(edge, x): x > edge 为1, 否则为0
        
        // 拿到时间，值为:0 ~ 1
        float time = fract(czm_frameNumber / 60.0);
        // 1秒来回, 改为10秒来回
        time = fract(czm_frameNumber / (60.0 * 10.0));
        // 实现往返效果，值为还是:0 ~ 1
        time = abs(time - 0.5) * 2.0;
        // 拿到高度diff, 值为: 0 ~ 1
        float diff = clamp(fsInput.attributes.positionMC.z / 500.0, 0.0, 1.0);
        // 当diff与time越接近时, 相减的值也越接近0
        diff = abs(diff - time);
        // 拿到为0的区域, 当diff与time相差小于0.01, 返回0
        diff = step(0.01, diff);
        // 为0的区域发光
        material.diffuse += vec3(0.3) * (1.0 - diff);
      }
    `
  });

}