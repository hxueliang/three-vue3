import * as THREE from 'three';
import scene from './scene';
import CameraModule from './camera';
import renderer from './renderer';
import controlsModule from './controls';

import { updateMesh } from './createMesh';

const clock = new THREE.Clock();

export default function animate() {
  const time = clock.getDelta();

  updateMesh(time * 10);

  controlsModule.controls && controlsModule.controls.update(time);
  renderer.render(scene, CameraModule.activeCamera);
  requestAnimationFrame(animate);
};