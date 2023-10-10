import * as Cesium from "cesium";

export default class ParticleLight {
  constructor(viewer, color = Cesium.Color.RED) {
    // 创建box实体
    this.boxEntity = viewer.entities.add({
      name: 'box',
      position: Cesium.Cartesian3.fromDegrees(113.3191, 23.109, 250),
      box: {
        dimensions: new Cesium.Cartesian3(100.0, 100.0, 500),
        material: Cesium.Color.RED.withAlpha(0.5),
      }
    });

    const particleSystem = new Cesium.ParticleSystem({
      image: './texture/cesium/smoke.png', // 粒子纹理
      // imageSize: new Cesium.Cartesian2(20, 20), // 粒子图像大小
      minimumImageSize: new Cesium.Cartesian2(10, 10),// 粒子图像大小随机-下限
      maximumImageSize: new Cesium.Cartesian2(30, 30),// 粒子图像大小随机-上限
      startColor: color, // 设置开始的颜色
      endColor: Cesium.Color.WHITE.withAlpha(0), // 设置结束的颜色
      startScale: 0.1, // 开始的时候粒子的大小
      endScale: 4.0, // 结束的时候粒子的大小
      // speed: 5.0, // 速度，米/秒
      minimumSpeed: 1.0, // 随机的发射速度-下限
      maximumSpeed: 10.0, // 随机的发射速度-上限
      // emitter: new Cesium.CircleEmitter(100), // 设置圆形发射器
      emitter: new Cesium.BoxEmitter(new Cesium.Cartesian3(100.0, 100.0, 500)), // 设置立方体形发射器
      emissionRate: 30, // 发射率，设置每秒产生粒子数量
      lifetime: 10.0, // 粒子的生命周期，秒
      // 设置粒子发射的位置，通boxEntity在参数1时间点的位置，生成矩阵存入参数2
      modelMatrix: this.boxEntity.computeModelMatrix(
        viewer.clock.currentTime, // 时间
        new Cesium.Matrix4() // 矩阵
      ),
    });

    viewer.scene.primitives.add(particleSystem);
  }
}