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
      }
    `
  });

}