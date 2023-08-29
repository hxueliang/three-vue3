import * as THREE from 'three';
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

const scene = new THREE.Scene();

const hdrLoader = new RGBELoader();
hdrLoader.loadAsync("./hdr/023.hdr").then((texture) => {
  scene.background = texture;
  scene.environment = texture;
  scene.environment.mapping = THREE.EquirectangularReflectionMapping;
});


export default scene;