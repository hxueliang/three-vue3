import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

export default function modifyMap(viewer) {

  // 获取地图影像图层
  const baseLayer = viewer.imageryLayers.get(0);
  // 是否进行颜色翻转
  baseLayer.invertColor = true;
  // 是否进行颜色过滤
  baseLayer.filterRGB = [0, 50, 100];

  modifyShader(viewer, baseLayer); // 能改变颜色

  /*
  const gui = new GUI();
  gui.add(baseLayer.filterRGB, '0', 0, 255).step(1).onChange((e) => {
    baseLayer.filterRGB[0] = e;
    modifyShader(viewer, baseLayer);
  });
  */
}

function modifyShader(viewer, baseLayer) {
  // 更改底图着色器的代码
  const baseFragmentShader = viewer.scene.globe._surfaceShaderSet.baseFragmentShaderSource.sources;

  for (let i = 0; i < baseFragmentShader.length; i++) {
    let strS = 'color = czm_saturation(color, textureSaturation);\n#endif\n';
    let strT = 'color = czm_saturation(color, textureSaturation);\n#endif\n';

    if (baseLayer.invertColor) {
      strT += `
        color.r = 1.0 - color.r;
        color.g = 1.0 - color.g;
        color.b = 1.0 - color.b;
      `;
    }

    if (baseLayer.filterRGB) {
      strT += `
        color.r = color.r * ${baseLayer.filterRGB[0]}.0 / 255.0;
        color.g = color.g * ${baseLayer.filterRGB[1]}.0 / 255.0;
        color.b = color.b * ${baseLayer.filterRGB[2]}.0 / 255.0;
      `;
    }

    baseFragmentShader[i] = baseFragmentShader[i].replace(strS, strT);
  }
}