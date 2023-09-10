import * as THREE from 'three';
import { Lensflare, LensflareElement } from 'three/examples/jsm/objects/Lensflare';

export default class SphereSky {
  constructor(radius, uTime, envMap) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshBasicMaterial({
      map: envMap,
      side: THREE.BackSide,
    });
    material.onBeforeCompile = (shader => {
      shader.uniforms.uTime = uTime;
      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <common>`,
        `#include <common>
         uniform float uTime;
        `
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <dithering_fragment>`,
        `#include <dithering_fragment>
        float strength = 0.0;
        float time = abs(uTime - 12.0);
        if (time < 4.0) {
          strength = 1.0;
        }
        if (time > 6.0) {
          strength = 0.15;
        }
        if (time >= 4.0 && time <= 6.0) {
          strength = 1.0 - (time - 4.0) / 2.0;
          strength = clamp(strength, 0.15, 1.0); // 限制在0.15~1.0
        }
         gl_FragColor = mix(vec4(0, 0, 0, 1), gl_FragColor, strength);
        `
      );
    });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.y = -Math.PI / 2;

    // 添加太阳
    this.sun = new THREE.Mesh(
      new THREE.SphereGeometry(100, 32, 32),
      new THREE.MeshStandardMaterial({ emissive: 0xffffcc })
    );
    this.sun.position.set(150, 500, 4000);
    this.sun.visible = false; // 默认为夜晚，不显示

    // 添加直线光
    const sunLight = new THREE.DirectionalLight(0xffffcc, 10);
    sunLight.castShadow = true;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 10000;
    sunLight.shadow.camera.left = -1000;
    sunLight.shadow.camera.right = 1000;
    sunLight.shadow.camera.top = 1000;
    sunLight.shadow.camera.bottom = -1000;
    sunLight.shadow.mapSize.width = 20480;
    sunLight.shadow.mapSize.height = 20480;
    sunLight.shadow.radius = 5;
    this.sun.add(sunLight);

    // 光晕效果
    const textureLoader = new THREE.TextureLoader();
    const textureFlare0 = textureLoader.load('./textures/lensflare/lensflare0.png');
    const lensflare = new Lensflare(); // 创建一个模拟追踪着灯光的镜头光晕
    lensflare.addElement(new LensflareElement(textureFlare0, 700, 0));
    sunLight.add(lensflare);
  }

  updateSunPosition(time) {
    /**
     * 画圆
     * 开始：6点
     * 一圈：2 * Math.PI
     * 需要：24小时
     * 半径：4000
     */
    this.sun.position.z = Math.cos((time - 6) * 2 * Math.PI / 24) * 4000;
    this.sun.position.y = Math.sin((time - 6) * 2 * Math.PI / 24) * 4000;
  }
}