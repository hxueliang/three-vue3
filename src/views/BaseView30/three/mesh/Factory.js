import * as THREE from 'three';
import { ref } from 'vue';
import gsap from "gsap";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer";

import eventHub from '@/utils/event-hub';
import CameraModule from '../camera';
import ControlsModule from '../controls';


export default class Factory {
  constructor(scene) {
    this.scene = scene;
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('./draco/');
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load('./model/factory/factory-one.glb', gltf => {
      console.log(gltf.scene);
      scene.add(gltf.scene);
      gltf.scene.traverse(child => {
        if (child.isMesh) {
          // 放射光强度。调节发光颜色。默认为1。
          child.material.emissiveIntensity = 20;
        }
        if (child.type === 'Object3D' && child.children.length === 0) {
          console.log(child.name);
          this.createTag(child);
        }
      });

    });
  }

  createTag({ name, position, temperature = '26', humidness = '58', }) {
    const element = document.createElement('div');
    element.className = 'factory elementTag';
    element.innerHTML = `
      <div class="elementContent">
        <h3>${name}</h3>
        <p>${temperature}°c</p>
        <p>${humidness}%</p>
      </div>
    `;

    const css3dObject = new CSS3DObject(element);
    css3dObject.scale.set(0.2, 0.2, 0.2);
    css3dObject.position.copy(position);
    this.scene.add(css3dObject);
  }

  update(time) {
    if (this.mixer) {
      // this.mixer.update(time);
    }
  }

  carAnimation() {
  }
}