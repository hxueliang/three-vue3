import * as THREE from 'three';
import scene from './scene';
import camera from './camera';
import renderer from './renderer';
import controls from './controls';

const clock = new THREE.Clock();

export default function animate() {
  const elapsed = clock.getElapsedTime();

  controls && controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};