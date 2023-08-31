import renderer from './renderer';
import CameraModule from './camera';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const controls = new OrbitControls(CameraModule.activeCamera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

export default controls;