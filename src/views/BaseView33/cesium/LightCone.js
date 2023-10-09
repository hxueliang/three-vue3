import * as Cesium from 'cesium';
import gsap from 'gsap';

export default class LightCone {
  constructor(viewer) {
    this.params = {
      height: 700,
      degress: 0,
    };

    try {
      (async () => {
        // 添加光锥模型
        this.model = viewer.scene.primitives.add(
          await Cesium.Model.fromGltfAsync({
            url: './model/cesium/pyramid.glb',
            show: true,
            scale: 200,
            minimumPixelSize: 12, // 最小像素
            maximumScale: 20000, // 最大的放大比例
            allowPicking: true, // 允许被选择被点击
            debugShowBoundingVolume: false, // 显示debug边框
            debugWireframe: false, // 显示debug线框
            color: Cesium.Color.YELLOW.withAlpha(0.5),
            colorBlendMode: Cesium.ColorBlendMode.MIX, // 设置颜色的混合模式
            modelMatrix: this.getModelMatrix(), // 设置模型的位置矩阵
          })
        );
      })();
    } catch (error) {
      console.log(error);
    }

    this.animate();
  }

  getModelMatrix() {
    return Cesium.Transforms.headingPitchRollToFixedFrame( // 设置模型的位置矩阵
      Cesium.Cartesian3.fromDegrees(113.31915, 23.10902, this.params.height), // 位置
      new Cesium.HeadingPitchRoll(this.params.degress, 0, 0) // 模型旋转情况
    );
  }

  animate() {
    gsap.to(this.params, {
      height: 800,
      degress: Math.PI,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      onUpdate: () => {
        this.model && (this.model.modelMatrix = this.getModelMatrix());
      }
    });
  }
}