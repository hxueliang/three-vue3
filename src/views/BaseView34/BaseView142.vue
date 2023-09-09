<!-- 142.智慧城市 -->
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
  // threePlus.setBg("./hdr/sky11.hdr");

  // threePlus.addClouds();
  // threePlus.addCloudsPlus();

  // threePlus.addOcean();

  const meta = await threePlus.gltfLoader('./model/metaverse/metaScene.glb');
  const metaScene = meta.scene;

  let planeGroup = new THREE.Group();
  planeGroup.position.copy(metaScene.children[0].position);
  metaScene.add(planeGroup);

  metaScene.traverse((child) => {
    if (!child.isMesh || !child.material) { return; }
    if (child.material.name.indexOf("KB3D_DLA_ConcreteRiverRock") != -1) {
      // console.log("地面", child);
      // child.material.color.set(0x00ffff);
      // child.material.map = null;
      planeGroup.add(child.clone());
      child.visible = false;
    }
    if (child.material.name.indexOf("KB3D_DLA_ConcreteScreedTan") != -1) {
      // console.log("墙", child);
      planeGroup.add(child.clone());
      child.visible = false;
    }
    if (child.material.name.indexOf("KB3D_DLA_ConcretePittedGrayLight") != -1) {
      // console.log("光墙", child);
      planeGroup.add(child.clone());
      child.visible = false;
    }
  });
  threePlus.addPhysics(planeGroup);
  threePlus.scene.add(metaScene);

  threePlus.addVideoPlane(
    './video/keji1.mp4',
    new THREE.Vector2(2, 2),
    new THREE.Vector3(5, 2, 0),
    new THREE.Vector3(0, -Math.PI / 2, 0),
  );

  const videoPlanePosition = new THREE.Vector3(-6, 0, 15);
  const videoPlane = threePlus.addVideoPlane(
    './video/opticalArray.mp4',
    new THREE.Vector2(2, 2),
    videoPlanePosition,
    new THREE.Euler(-Math.PI / 2, 0, 0),
  );
  threePlus.physics.onPosition(
    videoPlanePosition,
    () => {
      console.log("触发进入光圈");
      videoPlane.mesh.visible = false;
      threePlus.addCanvasPlane(
        "恭喜到达指定位置",
        new THREE.Vector3(-6, 1.5, 20),
        new THREE.Euler(0, Math.PI, 0)
      );
    },
    () => {
      console.log("触发离开光圈");
      lightCircle.mesh.visible = true;
    }
  );

  let lightCirclePosition = new THREE.Vector3(-10, 0, 15);
  let lightCircle = threePlus.addLightCircle(lightCirclePosition, 1.5);
  // 监听是否进入光阵
  threePlus.physics.onPosition(
    lightCirclePosition,
    () => {
      console.log("触发进入光圈");
      lightCircle.mesh.visible = false;
      threePlus.addTextVideo(
        "恭喜到达指定位置",
        new THREE.Vector3(-10, 1.5, 20),
        new THREE.Euler(0, Math.PI, 0)
      );
    },
    () => {
      console.log("触发离开光圈");
      lightCircle.mesh.visible = true;
    }
  );

  threePlus.setLight();
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