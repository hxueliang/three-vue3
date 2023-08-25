import * as THREE from 'three';
import gsap from 'gsap';
import vertex from '@/shader/light-radar/vertex.glsl';
import fragment from '@/shader/light-radar/fragment.glsl';

export default class LightRadar {
  constructor() {
    this.geometry = new THREE.PlaneGeometry(9, 9);

    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      side: THREE.DoubleSide,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xf00000) }
      }
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(-8, 1, 8);
    this.mesh.rotation.x = -Math.PI / 2;

    gsap.to(this.material.uniforms.uTime, {
      value: 2 * Math.PI,
      duration: 4,
      repeat: -1,
      ease: 'none',
    });
  }
}