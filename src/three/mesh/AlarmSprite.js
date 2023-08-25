import * as THREE from 'three';
import camera from '../camera';

export default class AlarmSprite {
  constructor() {
    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load('./icon/ld.png');
    this.material = new THREE.SpriteMaterial({ map });

    this.mesh = new THREE.Sprite(this.material);

    this.mesh.position.set(-4.2, 3.5, -1.3);

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
}