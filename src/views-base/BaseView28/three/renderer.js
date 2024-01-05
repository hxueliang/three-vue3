import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  // 是否使用对数深度缓存。如果要在单个场景中处理巨大的比例差异，就有必要
  logarithmicDepthBuffer: true,
  physicallyCorrectLights: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

export default renderer;