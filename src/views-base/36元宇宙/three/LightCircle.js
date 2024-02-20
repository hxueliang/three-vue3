import * as THREE from 'three';
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default class LightCircle {
  constructor(
    scene,
    position = new THREE.Vector3(0, 0, 0),
    scale = 1
  ) {
    // 加载视频
    this.video = document.createElement('video');
    this.video.src = './video/zp2.mp4';
    this.video.muted = true;
    this.video.loop = true;
    this.video.play();
    const texture = new THREE.VideoTexture(this.video);
    texture.repeat.set(9 / 16, 1);
    texture.offset.set((1 - 9 / 16) / 2, 0);
    this.gltfLoader('./model/metaverse/lightCircle.glb').then(gltf => {
      this.mesh = gltf.scene.children[0];
      this.mesh.material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        map: texture,
        alphaMap: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      this.mesh.position.copy(position);

      this.mesh.scale.set(scale, scale, scale);
      scene.add(this.mesh);
    });

  }

  gltfLoader(url) {
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("./draco/gltf/");
    dracoLoader.setDecoderConfig({ type: "js" });
    dracoLoader.preload();
    gltfLoader.setDRACOLoader(dracoLoader);

    return new Promise((resolve, reject) => {
      gltfLoader.load(url, (gltf) => {
        resolve(gltf);
      });
    });
  }
}