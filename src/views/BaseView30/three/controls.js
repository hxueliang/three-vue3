import { renderer } from './renderer';
import CameraModule from './camera';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls';
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
import eventHub from '@/utils/event-hub';

class ControlsModule {
  constructor() {
    this.setOrbitControls();

    eventHub.on('toggleControls', name => {
      const fnName = `set${name}Controls`;
      this[fnName]();
    });
  }

  setOrbitControls() {
    this.controls = new OrbitControls(CameraModule.activeCamera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    this.controls.maxPolarAngle = Math.PI / 2;
    this.controls.minPolarAngle = 0;
  }

  setTrackballControls() {
    this.controls = new TrackballControls(CameraModule.activeCamera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
  }

  setFlyControls() {
    this.controls = new FlyControls(CameraModule.activeCamera, renderer.domElement);
    // 移动速度
    this.controls.movementSpeed = 10;
    // rollSpeed
    this.controls.rollSpeed = Math.PI / 10;
  }

  setFirstPersonControls() {
    this.controls = new FirstPersonControls(CameraModule.activeCamera, renderer.domElement);
    this.controls.movementSpeed = 100;
  }
}

export default new ControlsModule();