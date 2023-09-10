import * as THREE from "three";
// 导入轨道控制器
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// 导入加载器
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
// 导入后期效果合成器
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
// three框架本身自带效果
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { SSAARenderPass } from "three/examples/jsm/postprocessing/SSAARenderPass";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
// 导入gsap
import gsap from 'gsap';

export default class ThreePlus {
  constructor(selector) {
    this.mixers = [];
    this.actions = [];
    this.textVideoArrays = [];
    this.updateMeshArr = [];
    this.clock = new THREE.Clock();
    this.domElement = document.querySelector(selector);
    this.width = this.domElement.clientWidth;
    this.height = this.domElement.clientHeight;
    this.init();
  }

  init() {
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initControl();
    this.initEffect();
    this.render();
    this.addAxis();
    // console.log(this.renderer.info);
  }

  initScene() {
    this.scene = new THREE.Scene();
  }

  initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      0.000001,
      10000
    );
    this.camera.position.set(0, 5, 12);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      logarithmicDepthBuffer: true,
      antialias: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.2;
    this.domElement.appendChild(this.renderer.domElement);
  }
  initControl() {
    this.control = new OrbitControls(this.camera, this.renderer.domElement);
  }
  render() {
    let deltaTime = this.clock.getDelta();
    // 更新mixers
    for (let i = 0; i < this.mixers.length; i++) {
      this.mixers[i].update(deltaTime * 0.2);
    }
    this.physics && this.physics.update(deltaTime);
    this.textVideoArrays.forEach(item => item.update(deltaTime));
    this.updateMeshArr.forEach(item => item.update(deltaTime));
    this.effectComposer.render();
    requestAnimationFrame(this.render.bind(this));
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

  fbxLoader(url) {
    const fbxLoader = new FBXLoader();
    return new Promise((resolve, reject) => {
      fbxLoader.load(url, (fbx) => {
        resolve(fbx);
      });
    });
  }

  hdrLoader(url) {
    const hdrLoader = new RGBELoader();
    return new Promise((resolve, reject) => {
      hdrLoader.load(url, (hdr) => {
        resolve(hdr);
      });
    });
  }

  setBg(url) {
    return new Promise((resolve, reject) => {
      this.hdrLoader(url).then((texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.anisotropy = 16;
        texture.format = THREE.RGBAFormat;
        // this.scene.background = texture;
        this.scene.environment = texture;
        resolve(texture);
      });
    });
  }

  setBgJpg(url) {
    let texture = new THREE.TextureLoader().load(url);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.anisotropy = 16;
    texture.format = THREE.RGBAFormat;
    this.scene.background = texture;
    this.scene.environment = texture;
  }

  setBgColor(color) {
    this.scene.background = new THREE.Color(color);
    this.scene.environment = new THREE.Color(color);
  }

  setLight() {
    // 添加环境光
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(this.ambientLight);

    const light1 = new THREE.DirectionalLight(0xffffff, 0.1);
    const light2 = new THREE.DirectionalLight(0xffffff, 0.1);
    const light3 = new THREE.DirectionalLight(0xffffff, 0.6);

    light2.position.set(0, 10, -10);
    light1.position.set(0, 10, 10);
    light3.position.set(10, 10, 10);

    light1.castShadow = true;
    light2.castShadow = true;
    light3.castShadow = true;

    light1.shadow.mapSize.width = 10240;
    light2.shadow.mapSize.width = 10240;
    light3.shadow.mapSize.width = 10240;

    light1.shadow.mapSize.height = 10240;
    light2.shadow.mapSize.height = 10240;
    light3.shadow.mapSize.height = 10240;

    this.scene.add(light1, light2, light3);
  }

  initEffect() {
    // 合成效果
    this.effectComposer = new EffectComposer(this.renderer);
    this.effectComposer.setSize(this.width, this.height);

    // 添加渲染通道
    const renderPass = new RenderPass(this.scene, this.camera);
    this.effectComposer.addPass(renderPass);

    // 点效果
    // const dotScreenPass = new DotScreenPass();
    // dotScreenPass.enabled = false;
    // effectComposer.addPass(dotScreenPass);

    // 抗锯齿
    // const smaaPass = new SMAAPass();
    // this.effectComposer.addPass(smaaPass);

    // // 辉光效果
    // this.unrealBloomPass = new UnrealBloomPass();
    // this.unrealBloomPass.enabled = false;
    // this.unrealBloomPass.threshold = 0.1;
    // this.unrealBloomPass.strength = 0.5;
    // this.unrealBloomPass.radius = 2;
    // this.effectComposer.addPass(this.unrealBloomPass);
  }

  addAxis() {
    let axis = new THREE.AxesHelper(5);
    this.scene.add(axis);
  }

}