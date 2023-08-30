import * as THREE from 'three';

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(4.1, 1, 0.5);

export default camera;