import * as THREE from 'three';
import scene from '@/three/scene';
import camera from '@/three/camera';
import renderer from '@/three/renderer';
import controls from '@/three/controls';

const clock = new THREE.Clock();

export default function animate() {
  const elapsed = clock.getElapsedTime();

  controls && controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};