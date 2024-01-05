import * as Cesium from 'cesium';

export default class MousePosition {
  constructor(viewer) {
    this.divDom = document.createElement('div');
    this.divDom.style.cssText = `
      position: fixed;
      bottom: 0;
      right: 0;
      width: 200px;
      height: 40px;
      line-height: 40px;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-size: 14px;
      text-align: center;
      z-index: 100;
    `;
    document.body.appendChild(this.divDom);
    // 监听鼠标移动事件
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(movement => {
      // 获取鼠标坐标
      const cartesian = viewer.camera.pickEllipsoid(
        movement.endPosition,
        viewer.scene.globe.ellipsiod
      );
      if (cartesian) {
        // 转换成经纬度
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(3);
        const latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(3);
        const heightString = cartographic.height;

        const text = `经度：${longitudeString} 纬度：${latitudeString}`;
        this.divDom.innerHTML = text;
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }
}