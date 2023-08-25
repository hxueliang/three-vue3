import * as THREE from 'three';

const scene = new THREE.Scene();

const cubeTextureLoader = new THREE.CubeTextureLoader().setPath('./textures/city/');
const textureCube = cubeTextureLoader.load([
  'night_1.jpg',
  'night_2.jpg',
  'night_3.jpg',
  'night_4.jpg',
  'night_5.jpg',
  'night_6.jpg'
]);

scene.background = textureCube;
scene.environment = textureCube;

export default scene;