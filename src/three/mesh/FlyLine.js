import * as THREE from 'three';
import gsap from 'gsap';

const textloader = new THREE.TextureLoader();

export default class FlyLine {
  constructor() {
    let linePoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(5, 4, 0),
      new THREE.Vector3(10, 0, 0),
    ];
    // 创建曲线
    this.lineCurve = new THREE.CatmullRomCurve3(linePoints);
    // 根据曲线生成管道几何体
    this.geometry = new THREE.TubeGeometry(
      this.lineCurve,
      100,
      0.4,
      2,
      false
    );
    // 创建纹理
    this.texture = textloader.load("./textures/city/z_112.png");
    this.texture.repeat.set(1, 2);
    this.texture.wrapS = THREE.RepeatWrapping;
    this.texture.wrapT = THREE.MirroredRepeatWrapping;
    // 创建材质
    this.material = new THREE.MeshBasicMaterial({
      // color: 0xffff00,
      map: this.texture,
      transparent: true
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    gsap.to(this.texture.offset, {
      x: -1,
      duration: 2,
      repeat: -1,
      ease: 'none'
    });
  }
}