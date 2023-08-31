import * as THREE from 'three';
import scene from './scene';
import CameraModule from './camera';
import renderer from './renderer';
import controls from './controls';

import { updateMesh } from '../three/createMesh';

const clock = new THREE.Clock();

export default function animate() {
  const time = clock.getDelta();

  updateMesh(time * 10);

  controls && controls.update();
  renderer.render(scene, CameraModule.activeCamera);
  requestAnimationFrame(animate);
};