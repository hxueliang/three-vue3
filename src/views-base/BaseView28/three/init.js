import CameraModule from './camera';
import renderer from './renderer';

function onWindowResize() {
  const innerWidth = window.innerWidth;
  const innerHeight = window.innerHeight;
  renderer.setSize(innerWidth, innerHeight);
  CameraModule.activeCamera.aspect = innerWidth / innerHeight;
  CameraModule.activeCamera.updateProjectionMatrix();
}

window.addEventListener('resize', onWindowResize);