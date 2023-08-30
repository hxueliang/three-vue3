import * as THREE from 'three';
import { ref } from 'vue';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

import eventHub from '@/utils/event-hub';

export default class Area {
  constructor(scene) {
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('./draco/');
    gltfLoader.setDRACOLoader(dracoLoader);
    gltfLoader.load('./model/area/area.glb', gltf => {
      console.log(gltf);
      scene.add(gltf.scene);
      this.gltf = gltf;
      gltf.scene.traverse(child => {
        if (child.name === '热气球') {
          // 创建动画混合器，动画混合器是用于场景中特定对象的动画的播放器
          this.mixer = new THREE.AnimationMixer(child);
          // 拿到动作片段
          this.clip = gltf.animations[0];
          // clipAction，返回所传入的剪辑参数的AnimationAction, 根对象参数可选，默认值为混合器的默认根对象。第一个参数可以是动画剪辑(AnimationClip)对象或者动画剪辑的名称。
          this.action = this.mixer.clipAction(this.clip);
          // 播放动画
          this.action.play();
        }

      });
    });

    eventHub.on("actionClick", (i) => {
      console.log(i);
      // this.action.reset();
      this.clip = this.gltf.animations[i];
      this.action = this.mixer.clipAction(this.clip);
      this.action.play();
    });
  }

  update(time) {
    if (this.mixer) {
      this.mixer.update(time);
    }
  }
}