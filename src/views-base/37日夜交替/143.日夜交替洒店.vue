<!-- 143.日夜交替洒店 -->
<template>
  <div class="home" ref="screenDom">
    <div class="canvas-container"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import * as THREE from "three";
import ThreePlus from "./three/index";

let screenDom = ref(null);

const resizeFn = () => {
  let scale = window.innerWidth / 1920;
  screenDom.value.style.transform = `scale(${scale})`;
};

onMounted(() => {
  resizeFn();
  window.addEventListener("resize", resizeFn);
});

onMounted(async () => {
  let threePlus = new ThreePlus(".canvas-container");
  window.threePlus = threePlus;

  // #region
  const bgPromise = threePlus.setBg('./hdr/023.hdr');

  threePlus.addOcean();

  // 加载视频
  const video = document.createElement('video');
  video.src = './video/sucai01.mp4';
  video.muted = true;
  video.loop = true;
  video.play();
  const videoTexture = new THREE.VideoTexture(video);

  const gltf = await threePlus.gltfLoader('./public/model/hotel/building.glb');
  const metaScene = gltf.scene;
  threePlus.scene.add(metaScene);
  let vetroMaterial = null;
  metaScene.traverse(child => {
    if (!child.isMesh) { return; }
    child.castShadow = true;
    child.receiveShadow = true;
    // shadowSide定义投影的面
    // BackSide为前面，能消除阴影纹路
    child.material.shadowSide = THREE.BackSide;
    if (child.name === 'Plane') {
      child.visible = false;
    }
    if (child.material.name === 'Vetro' && !vetroMaterial) {
      vetroMaterial = child.material;
      vetroMaterial.emissive = new THREE.Color(0x99ff99);
      vetroMaterial.emissiveMap = videoTexture;
      vetroMaterial.emissiveIntensity = 1;
      // 设置辉光效果
      threePlus.unrealBloomPass.enabled = true;
    }
  });
  // #endregion
  bgPromise.then(() => {
    threePlus.addSphereSky(() => {
      vetroMaterial && (vetroMaterial.emissive = new THREE.Color(0x000000));
      console.log(threePlus.unrealBloomPass.enabled);
      threePlus.unrealBloomPass.enabled = false;
      console.log('白天');
    }, () => {
      vetroMaterial && (vetroMaterial.emissive = new THREE.Color(0x99ff99));
      console.log(threePlus.unrealBloomPass.enabled);
      threePlus.unrealBloomPass.enabled = true;
      console.log('夜晚');
    });
  });
});

</script>

<style lang="less" scope>
.home {
  width: 1920px;
  height: 1080px;
  transform-origin: 0 0;
}

.canvas-container {
  width: 100%;
  height: 100%;
}
</style>