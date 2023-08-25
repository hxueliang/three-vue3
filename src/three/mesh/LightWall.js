import * as THREE from 'three';
import gsap from 'gsap';
import vertex from '@/shader/light-wall/vertex.glsl';
import fragment from '@/shader/light-wall/fragment.glsl';

export default class LightWall {
  constructor() {
    this.geometry = new THREE.CylinderGeometry(5, 5, 2, 32, 1, true);

    this.geometry.computeBoundingBox();
    const { max, min } = this.geometry.boundingBox;
    const uHeight = max.y - min.y;

    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        uHeight: { value: uHeight },
      }
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.y = 1;

    gsap.to(this.mesh.scale, {
      x: 2,
      z: 2,
      duration: 1,
      repeat: -1,
      yoyo: true,
    });
  }
}