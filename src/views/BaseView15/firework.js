import * as THREE from 'three';

import startVertexShader from "../../shader/firework-start/vertex.glsl?raw";
import startFragmentShader from '../../shader/firework-start/fragment.glsl?raw';

// 98.1.1 创建烟花类
export default class Fireworks {
  // 98.3.2 构造函数
  constructor(color, to, from = { x: 0, y: 0, z: 0 }) {
    console.log(color, to);

    // 98.5.1 创建烟花发射点的几何体
    this.startGeometry = new THREE.BufferGeometry();
    const startPositionArr = new Float32Array([0, 0, 0]);
    this.startGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(startPositionArr, 3)
    );
    // 98.5.2 设置着色器材质
    this.startMaterial = new THREE.ShaderMaterial({
      vertexShader: startVertexShader,
      fragmentShader: startFragmentShader,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    // 98.5.3 创建烟花点球
    this.startPoint = new THREE.Points(
      this.startGeometry,
      this.startMaterial
    );
  }

  // 98.4.2 添加到场景
  addScene(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    scene.add(this.startPoint);
  }
}