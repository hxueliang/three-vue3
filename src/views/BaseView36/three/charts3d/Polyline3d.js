import * as THREE from 'three';
import gsap from 'gsap';
import SpriteText from '../SpriteText';
import { Sphere } from 'cannon-es';


const { sin, cos, random, PI } = Math;

export default class Polyline3d {
  constructor(data) {
    this.mesh = new THREE.Group();

    const extrudeSettings = {
      steps: 1,
      depth: 0.5,
      bevelEnabled: false,
      bevelThickness: 1,
      bevelSize: 1,
      bevelOffset: 0,
      bevelSegments: 5,
    };
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    data.forEach(({ value, type }, i) => {
      shape.lineTo(i, value);
      const position = new THREE.Vector3(i, value + 0.5, 0);
      const spriteText = new SpriteText(`${value}${type}`, position);
      this.mesh.add(spriteText.mesh);
    });
    shape.lineTo(data.length - 1, 0);
    shape.lineTo(0, 0);
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(random() * 0xffffff),
      side: THREE.DoubleSide,
      opacity: 0.8,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    this.mesh.add(mesh);

    this.mesh.position.set(-3, 0, 0);
  }
}
