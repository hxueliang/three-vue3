import * as THREE from 'three';
import gsap from 'gsap';
import vertex from '@/shader/light-wall/vertex.glsl';
import fragment from '@/shader/light-wall/fragment.glsl';

export default class LightWall {
  constructor(
    position = { x: 0, z: 0 },
    radius = 2,
    scale = 2,
    color = 0xff0000
  ) {
    this.geometry = new THREE.CylinderGeometry(radius, radius, 2, 32, 1, true);

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
        uColor: { value: new THREE.Color(color) },
      }
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(position.x, 1, position.z);

    gsap.to(this.mesh.scale, {
      x: scale,
      z: scale,
      duration: 1,
      repeat: -1,
      yoyo: true,
    });
  }

  remove() {
    this.mesh.remove();
    this.mesh.removeFromParent();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}