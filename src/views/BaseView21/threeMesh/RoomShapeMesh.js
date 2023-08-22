import * as THREE from 'three';

export default class RoomShapeMesh extends THREE.Mesh {
  constructor(room, isTop) {
    super();

    this.room = room;
    this.isTop = isTop;
    this.roomShapePoints = room.areas;
    this.init();
  }
  init() {
    const roomShape = new THREE.Shape();
    // 根据项点，生成形状
    this.roomShapePoints.forEach((point, i) => {
      if (i === 0) {
        roomShape.moveTo(point.x / 100, point.y / 100);
      } else {
        roomShape.lineTo(point.x / 100, point.y / 100);
      }
    });
    // 根据形状，生成几何体
    let roomShapeGeometry = new THREE.ShapeGeometry(roomShape);
    // 旋转几何休顶点
    roomShapeGeometry.rotateX(Math.PI / 2);
    this.geometry = roomShapeGeometry;
    this.material = new THREE.MeshBasicMaterial({
      side: this.isTop ? THREE.FrontSide : THREE.DoubleSide,
      color: 0xff0000,
      transparent: true,
    });

    this.position.y = (this.isTop ? 2.8 : 0);
  }
}