import * as THREE from 'three';
import camera from '../camera';

export default class AlarmSprite {
  constructor(type = '火警', position = { x: 0, z: 0 }, color = 0xffffff) {
    const textureLoader = new THREE.TextureLoader();
    const typeObj = {
      电力: './textures/tag/e.png',
      火警: './textures/tag/fire.png',
      治安: './textures/tag/jingcha.png',
    };
    const map = textureLoader.load(typeObj[type]);
    this.material = new THREE.SpriteMaterial({
      map,
      color,
      depthTest: false,
      // blending: THREE.AdditiveBlending,
      transparent: true,

    });

    this.mesh = new THREE.Sprite(this.material);

    this.mesh.position.set(position.x, 3.5, position.z);

    this.fns = [];

    // 创建投射光线
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // 监听点击事件
    window.addEventListener('click', event => {
      mouse.x = event.clientX / window.innerWidth * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight * 2 - 1);
      raycaster.setFromCamera(mouse, camera);
      let result = raycaster.intersectObject(this.mesh);
      if (result.length > 0) {
        event.mesh = this.mesh;
        event.alarm = this;
        this.fns.forEach(fn => {
          fn(event);
        });
      }
    });
  }

  onClick(fn) {
    this.fns.push(fn);
  }

  remove() {
    this.mesh.remove();
    this.mesh.removeFromParent();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();

  }
}