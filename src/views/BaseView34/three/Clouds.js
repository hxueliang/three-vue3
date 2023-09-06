import * as THREE from 'three';
import gsap from 'gsap';

const textureLoader = new THREE.TextureLoader();
export default class Clouds {
  constructor(height = 10, number = 400, size = 12, scale = 10, autoRotation = true) {
    this.materials = [
      this.createTexture(1, 2),
      this.createTexture(2, 3),
      this.createTexture(3, 1),
    ];

    this.mesh = new THREE.Group();

    for (let i = 0; i < number; i++) {
      const index = Math.floor(Math.random() * 3);
      const material = this.materials[index];
      const sprite = new THREE.Sprite(material);

      const randomSize = Math.random() * size;
      sprite.scale.set(randomSize, randomSize, randomSize);

      const randomX = (Math.random() - 0.5) * 2 * scale;
      const randomY = Math.random() * height / 4 + scale;
      const randomZ = (Math.random() - 0.5) * 2 * scale;
      sprite.position.set(randomX, randomY, randomZ);

      this.mesh.add(sprite);
    }

    if (autoRotation) {
      this.animate();
    }
  }

  animate() {
    gsap.to(this.mesh.rotation, {
      y: Math.PI * 2,
      duration: 300,
      repeat: -1,
    });
  }

  createTexture(
    number1 = 1,
    number2 = 2,
    name = 'cloud',
    ext = 'jpg',
    baseUrl = './textures/cloud/',
  ) {
    const mapUrl = `${baseUrl}${name}${number1}.${ext}`;
    const alphaMapUrl = `${baseUrl}${name}${number2}.${ext}`;

    const map = textureLoader.load(mapUrl);
    const alphaMap = textureLoader.load(alphaMapUrl);

    const material = new THREE.SpriteMaterial({
      color: 0xfffffff,
      map,
      alphaMap,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: true,
    });
    return material;
  }
}