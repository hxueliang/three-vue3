import * as THREE from 'three';
import { ref } from 'vue';
import gsap from "gsap";
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

        if (child.name === '汽车园区轨迹') {
          const line = child;
          const points = [];
          // const points2 = [];
          const { position } = line.geometry.attributes;
          for (let i = position.count - 1; i >= 0; i--) {
            points.push(new THREE.Vector3(
              position.getX(i),
              position.getY(i),
              position.getZ(i)
            ));
            // points2.push(new THREE.Vector3(
            //   position.array[i * 3 + 0],
            //   position.array[i * 3 + 1],
            //   position.array[i * 3 + 2]
            // ));
          }

          // 创建曲线
          this.curve = new THREE.CatmullRomCurve3(points);
          // 在曲线的什么位置0~1
          this.curveProgress = 0;
          this.carAnimation();
        }

        if (child.name === '小汽车') {
          this.car = child;
        }

        if (child.name === 'NURBS_曲线') {
          child.visible = false;
        }
      });
    });

    eventHub.on("actionClick", (i) => {
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

  carAnimation() {
    gsap.to(this, {
      curveProgress: 0.999,
      duration: 30,
      repeat: -1,
      onUpdate: value => {
        const point = this.curve.getPoint(this.curveProgress);
        const { x, y, z } = point;
        this.car.position.set(x, y, z);
        // 获取下一个点，让小汽车朝向下一个点
        if (this.curveProgress + 0.001 < 1) {
          const nextPoint = this.curve.getPoint(this.curveProgress + 0.001);
          this.car.lookAt(nextPoint);
        }
      }
    });
  }
}