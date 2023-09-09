import * as THREE from 'three';

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
  }
}