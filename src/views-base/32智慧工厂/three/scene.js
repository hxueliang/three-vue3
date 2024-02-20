import * as THREE from 'three';
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const scene = new THREE.Scene();

const rgbeLoader = new RGBELoader();
rgbeLoader.load('./hdr/2k.hdr', envMap => {
  envMap.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = envMap;
  scene.environment = envMap;
});

const light = new THREE.DirectionalLight(0xffffff, 25);
light.position.set(1, 10, 1);
scene.add(light);

export default scene;