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

    this.floor1Group;
    this.floor2Group;
    this.wallGroup;
    this.floor2Tags = [];
    // 二楼
    gltfLoader.load('./model/factory/factory-floor2.glb', gltf => {
      console.log(gltf.scene);
      this.floor2Group = gltf.scene;
      gltf.scene.traverse(child => {
        if (child.isMesh) {
          // 放射光强度。调节发光颜色。默认为1。
          child.material.emissiveIntensity = 20;
        }
        if (child.type === 'Object3D' && child.children.length === 0) {
          console.log(child.name);
          const css3dObject = this.createTag(child);
          css3dObject.visible = false;
          this.floor2Tags.push(css3dObject);
          this.floor2Group.add(css3dObject);
        }
      });
      this.floor2Group.visible = false;
      this.floor2Group.aPosition = this.floor2Group.position.clone();
      scene.add(this.floor2Group);
    });

    // 一楼
    gltfLoader.load('./model/factory/factory-floor1.glb', gltf => {
      this.floor1Group = gltf.scene;
      this.floor1Group.visible = false;
      scene.add(gltf.scene);
    });

    // 外墙
    gltfLoader.load('./model/factory/wall.glb', gltf => {
      scene.add(gltf.scene);
      this.wallGroup = gltf.scene;
      this.wallGroup.aPosition = this.wallGroup.position.clone();
    });

    this.initEvent();
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
    // this.scene.add(css3dObject);

    return css3dObject;
  }

  showFloor1(bool) {
    this.floor1Group.visible = bool;
  }

  showFloor2(bool) {
    this.floor2Group.visible = bool;
    this.floor2Tags.forEach(item => item.visible = bool);
  }

  showWall(bool) {
    this.wallGroup.visible = bool;
  }

  initEvent() {
    eventHub.on('showFloor1', () => {
      this.showFloor1(true);
      this.showFloor2(false);
      this.showWall(false);
    });

    eventHub.on('showFloor2', () => {
      this.showFloor2(true);
      this.showFloor1(false);
      this.showWall(false);
      this.floor2GroupPositionRestore();
    });

    eventHub.on('showWall', () => {
      this.floor2GroupPositionRestore;
      this.wallPositionRestore();

      this.showWall(true);
      this.showFloor1(false);
      this.showFloor2(false);
    });

    eventHub.on('showAll', () => {
      this.floor2GroupPositionRestore;
      this.wallPositionRestore();

      this.showWall(true);
      this.showFloor1(true);
      this.showFloor2(true);

      gsap.to(this.wallGroup.position, {
        y: 200,
        duration: 1
      });

      gsap.to(this.floor2Group.position, {
        y: 60,
        duration: 1,
        delay: 1
      });
    });
  }

  wallPositionRestore() {
    const { x, y, z } = this.wallGroup.aPosition;
    this.wallGroup.position.set(x, y, z);
  }

  floor2GroupPositionRestore() {
    var { x, y, z } = this.floor2Group.aPosition;
    this.floor2Group.position.set(x, y, z);
  }

  update(time) {
    if (this.mixer) {
      // this.mixer.update(time);
    }
  }

  carAnimation() {
  }
}