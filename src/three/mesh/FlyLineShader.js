import * as THREE from 'three';
import gsap from 'gsap';
import vertex from '@/shader/fly-line/vertex.glsl';
import fragment from '@/shader/fly-line/fragment.glsl';

export default class FlyLineShader {
  constructor() {
    let linePoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(-5, 4, 0),
      new THREE.Vector3(-10, 0, 0),
    ];
    // 创建曲线
    this.lineCurve = new THREE.CatmullRomCurve3(linePoints);
    // 通过顶点创建几何体
    const points = this.lineCurve.getPoints(1000);
    this.geometry = new THREE.BufferGeometry().setFromPoints(points);
    // 给每个顶点设置属性
    const aSizeArray = new Float32Array(points.length);
    aSizeArray.map((_, i, arr) => arr[i] = i);
    this.geometry.setAttribute(
      'aSize',
      new THREE.BufferAttribute(aSizeArray, 1)
    );
    // 设置着色器材质
    this.shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.mesh = new THREE.Points(this.geometry, this.shaderMaterial);
  }
}