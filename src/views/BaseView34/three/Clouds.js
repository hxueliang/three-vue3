import * as THREE from 'three';
import gsap from 'gsap';

const textureLoader = new THREE.TextureLoader();

// 第一种实现方案：calls为401(400个精灵图和1个背景)
export class Clouds {
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
      depthTest: false,
      depthWrite: false,
    });
    return material;
  }

  animate() {
    gsap.to(this.mesh.rotation, {
      y: Math.PI * 2,
      duration: 300,
      repeat: -1,
    });
  }


}


// 第二种实现方案：calls为4(3个粒子群和1个背景)
export class CloudsPlus {
  constructor(height = 10, number = 400, size = 12, scale = 10, autoRotation = true) {
    this.height = height;
    this.number = number;
    this.size = size;
    this.scale = scale;
    const materials = [
      this.createTexture(1, 2),
      this.createTexture(2, 3),
      this.createTexture(3, 1),
    ];

    this.mesh = new THREE.Group();

    for (let i = 0; i < materials.length; i++) {
      const material = materials[i];
      const geometry = this.createGeometry(number);
      const points = new THREE.Points(geometry, material);
      this.mesh.add(points);
    }

    if (autoRotation) {
      this.animate();
    }
  }

  createGeometry() {
    const vertices = [];
    for (let i = 0; i < this.number; i++) {
      const randomX = (Math.random() - 0.5) * 2 * this.scale;
      const randomY = Math.random() * this.height / 2 + this.scale;
      const randomZ = (Math.random() - 0.5) * 2 * this.scale;
      vertices.push(randomX, randomY, randomZ);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
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

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      map,
      alphaMap,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      size: Math.random() * this.size + this.size
    });
    return material;
  }

  animate() {
    let i = 1;
    this.mesh.traverse(item => {
      gsap.to(this.mesh.rotation, {
        y: Math.PI * 2,
        duration: (2 ** i++) * 5,
        repeat: -1,
      });
    });

  }

}