import * as THREE from 'three';
import { ref } from 'vue';
import gsap from "gsap";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

import eventHub from '@/utils/event-hub';
import CameraModule from '../camera';
import ControlsModule from '../controls';

const gltfLoader = new GLTFLoader();

export default class Factory {
  constructor(scene) {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('./draco/');
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load('./model/factory/factory-one.glb', gltf => {
      console.log(gltf.scene);
      scene.add(gltf.scene);
    });
  }

  update(time) {
    if (this.mixer) {
      // this.mixer.update(time);
    }
  }

  carAnimation() {
  }
}