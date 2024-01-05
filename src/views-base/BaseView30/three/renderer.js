import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

const { innerWidth, innerHeight } = window;

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  // 是否使用对数深度缓存。如果要在单个场景中处理巨大的比例差异，就有必要
  logarithmicDepthBuffer: true,
  physicallyCorrectLights: true,
});
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.1;

const css3dRenderer = new CSS3DRenderer();
css3dRenderer.setSize(innerWidth, innerHeight);
// document.getElementById('cssrender').appendChild(css3dRenderer.domElement);
document.querySelector('#cssrender').appendChild(css3dRenderer.domElement);

export {
  renderer,
  css3dRenderer
};