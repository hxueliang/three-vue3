import * as THREE from 'three';
import eventHub from '@/utils/event-hub';

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(100, 100, 300);

class CameraModule {
  constructor() {
    this.activeCamera = camera;
    this.collection = {
      default: camera,
    };

    eventHub.on('toggleCamera', name => {
      this.setActive(name);
    });
  }
  add(name, camera) {
    this.collection[name] = camera;
  }
  setActive(name) {
    this.activeCamera = this.collection[name];
  }
}

export default new CameraModule;