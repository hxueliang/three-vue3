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

import vertexShader from '@/shader/fighter/vertex.glsl';
import fragmentShader from '@/shader/fighter/fragment.glsl';

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
      // console.log(gltf.scene);
      this.floor2Group = gltf.scene;
      gltf.scene.traverse(child => {
        if (child.isMesh) {
          // 放射光强度。调节发光颜色。默认为1。
          child.material.emissiveIntensity = 10;
        }
        if (child.type === 'Object3D' && child.children.length === 0) {
          // console.log(child.name);
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

    // 战斗机
    gltfLoader.load('./model/factory/fighter.glb', gltf => {
      this.scene.add(gltf.scene);
      this.fighterGroup = gltf.scene;
      this.fighterGroup.position.set(6, 58, 2);

      this.fighterGroup.visible = false;
      this.fighterGroup.aPosition = this.fighterGroup.position.clone();

      this.fighterGroup.traverse(child => {
        if (child.isMesh) {
          child.material.emissiveIntensity = 15;
        }
      });

      // 创建射线
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();

      // 事件的监听
      window.addEventListener("click", (event) => {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerWidth) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, CameraModule.activeCamera);

        const intersects = this.raycaster.intersectObject(this.fighterGroup);
        // console.log(intersects);
        if (intersects.length > 0) {
          this.showFloor2(!this.floor2Group.visible);
        }
      });

      this.showFighterTest();
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

  showFighter(bool) {
    this.fighterGroup.visible = bool;
  }

  // 只显示飞机，方便调试代码
  showFighterTest() {
    this.floor1Group && (this.floor1Group.visible = false);
    this.floor2Group && (this.floor2Group.visible = false);
    this.wallGroup && (this.wallGroup.visible = false);
    this.fighterGroup.visible = true;
  }

  createPoints() {
    // 创建点组件
    if (!this.fighterPointsGroup) {
      this.fighterPointsGroup = this.transformPoints();
      this.scene.add(this.fighterPointsGroup);
    }
  }

  transformPoints() {
    const texture = new THREE.TextureLoader().load("./texture/particles/1.png");
    const group = new THREE.Group();
    function createPoints(object3D, newObject3D) {
      if (!object3D.children || object3D.children.length <= 0) {
        return;
      }

      object3D.children.forEach(child => {
        if (child.isMesh) {
          const color = new THREE.Color(
            Math.random(),
            Math.random(),
            Math.random()
          );
          const material = new THREE.ShaderMaterial({
            uniforms: {
              uColor: { value: color },
              uTexture: { value: texture },
              uTime: { value: 0 },
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
          });
          const pointsMesh = new THREE.Points(child.geometry, material);
          pointsMesh.position.copy(child.position);
          pointsMesh.rotation.copy(child.rotation);
          pointsMesh.scale.copy(child.scale);
          newObject3D.add(pointsMesh);
          createPoints(child, pointsMesh);
        }
      });

    }
    createPoints(this.fighterGroup, group);

    return group;
  }

  pointsBlast() {
    if (!this.fighterPointsGroup) {
      console.log('先点击粒子特效');
      return;
    }
    this.fighterPointsGroup.traverse((child) => {
      if (!child.isPoints) { return; }
      const randomPositionArray = new Float32Array(
        child.geometry.attributes.position.count * 3
      );
      for (let i = 0; i < child.geometry.attributes.position.count; i++) {
        randomPositionArray[i * 3 + 0] = (Math.random() * 2 - 1) * 10;
        randomPositionArray[i * 3 + 1] = (Math.random() * 2 - 1) * 10;
        randomPositionArray[i * 3 + 2] = (Math.random() * 2 - 1) * 10;
      }
      child.geometry.setAttribute(
        'aPosition',
        new THREE.BufferAttribute(randomPositionArray, 3)
      );
      gsap.to(child.material.uniforms.uTime, {
        value: 10,
        duration: 5,
      });

    });
  }

  pointsRecover() {
    if (!this.fighterPointsGroup) {
      console.log('先点击粒子特效');
      return;
    }
    this.fighterPointsGroup.traverse((child) => {
      if (!child.isPoints) { return; }
      gsap.to(child.material.uniforms.uTime, {
        value: 0,
        duration: 5,
      });
    });
  }

  initEvent() {
    eventHub.on('showFloor1', () => {
      this.showFloor1(true);
      this.showFloor2(false);
      this.showFighter(false);
      this.showWall(false);
    });

    eventHub.on('showFloor2', () => {
      this.showFloor2(true);
      this.showFighter(true);
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
      this.showFighter(false);
    });

    eventHub.on('showAll', () => {
      this.floor2GroupPositionRestore;
      this.wallPositionRestore();

      this.showWall(true);
      this.showFloor1(true);
      this.showFloor2(true);
      this.showFighter(true);

      gsap.to(this.wallGroup.position, {
        y: 200,
        duration: 1
      });

      gsap.to(this.floor2Group.position, {
        y: 60,
        duration: 1,
        delay: 1
      });

      gsap.to(this.fighterGroup.position, {
        y: 120,
        duration: 1,
        delay: 1
      });
    });

    eventHub.on('flatFighter', type => {
      // 将飞机展成平面
      // 获取平面位置
      const positions = [];
      if (type === 'plane') {
        for (let x = 0; x < 5; x++) {
          for (let z = 0; z < 5; z++) {
            positions.push(new THREE.Vector3(x * 2 - 2, 0, z * 2 - 3));
          }
        }
      } else if (type === 'line') {
        for (let x = 0; x < 22; x++) {
          positions.push(new THREE.Vector3(x * 2 - 11.5, 0, 0));
        }
      }

      // console.log(positions);
      let n = 0;
      this.fighterGroup.traverse(child => {
        if (child.isMesh && positions[n]) {
          const vec3 = positions[n];
          const vec3Multiply20 = vec3.multiplyScalar(10);
          !child.srcPosition && (child.srcPosition = child.position.clone());

          // 复制到位置，无动画效果
          // child.position.copy(vec3Multiply20);

          // 移到到位置，有动画效果
          const { x, y, z } = vec3Multiply20;
          gsap.to(child.position, {
            x, y, z,
            duration: 1
          });

          n++;
        }
      });
    });

    eventHub.on('recoverFighter', () => {
      console.log('恢复飞机');
      let n = 0;
      this.fighterGroup.traverse(child => {
        if (child.isMesh && child.srcPosition) {
          const { x, y, z } = child.srcPosition;
          gsap.to(child.position, {
            x, y, z,
            duration: 2
          });
          n++;
        }
      });
    });

    eventHub.on('pointsFighter', () => {
      this.createPoints();
    });

    eventHub.on('pointsBlast', () => {
      this.pointsBlast();
    });

    eventHub.on('pointsRecover', () => {
      this.pointsRecover();
    });
  }

  wallPositionRestore() {
    const { x, y, z } = this.wallGroup.aPosition;
    this.wallGroup.position.set(x, y, z);
  }

  floor2GroupPositionRestore() {
    var { x, y, z } = this.floor2Group.aPosition;
    this.floor2Group.position.set(x, y, z);
    var { x, y, z } = this.fighterGroup.aPosition;
    this.fighterGroup.position.set(x, y, z);
  }

  update(time) {
    if (this.mixer) {
      // this.mixer.update(time);
    }
  }

  carAnimation() {
  }
}