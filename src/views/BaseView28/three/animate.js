import * as THREE from 'three';
import scene from './scene';
import camera from './camera';
import renderer from './renderer';
import controls from './controls';

import { updateMesh } from '../three/createMesh';

const clock = new THREE.Clock();

export default function animate() {
  const time = clock.getDelta();

  updateMesh(time / 4);

  controls && controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};