import * as THREE from 'three';

import startVertexShader from "../../shader/firework-start/vertex.glsl?raw";
import startFragmentShader from '../../shader/firework-start/fragment.glsl?raw';

// 98.1.1 创建烟花类
export default class Fireworks {
  // 98.3.2 构造函数
  constructor(color, to, from = { x: 0, y: 0, z: 0 }) {
    // 98.5.1 创建烟花发射点的几何体
    this.startGeometry = new THREE.BufferGeometry();
    const startPositionArr = new Float32Array([0, 0, 0]);
    this.startGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(startPositionArr, 3)
    );

    // 99.1 计算出起始点到爆炸点的向量，并传给顶点着色器
    const astepArray = new Float32Array([
      to.x - from.x,
      to.y - from.y,
      to.z - from.z
    ]);
    this.startGeometry.setAttribute('astep', new THREE.BufferAttribute(astepArray, 3));

    // 98.5.2 设置着色器材质
    this.startMaterial = new THREE.ShaderMaterial({
      vertexShader: startVertexShader,
      fragmentShader: startFragmentShader,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        // 99.5.1 传参
        uTime: {
          value: 0
        },
        uSize: {
          value: 20
        },
      }
    });

    // 98.5.3 创建烟花点球
    this.startPoint = new THREE.Points(
      this.startGeometry,
      this.startMaterial
    );

    // 99.2 创建时钟
    this.clock = new THREE.Clock();
  }

  // 98.4.2 添加到场景
  addScene(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    scene.add(this.startPoint);
  }

  // 99.3 更新
  update() {
    const elapsedTime = this.clock.getElapsedTime();

    if (elapsedTime < 1) {
      // 99.3.1 一秒内
      this.startMaterial.uniforms.uTime.value = elapsedTime;
      this.startMaterial.uniforms.uSize.value = 20;
    } else {
      // 99.3.2 超过一秒
      const tiem = elapsedTime - 1;
      this.startMaterial.uniforms.uSize.value = 0;
      this.startPoint.clear();
      this.startMaterial.dispose();
      this.startMaterial.dispose();
    }

  }
}