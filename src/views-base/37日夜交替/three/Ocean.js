import * as THREE from 'three';
import { Water } from 'three/examples/jsm/objects/Water2';

export default class Ocean {
  constructor(radius = 1000) {
    const geometry = new THREE.CircleGeometry(radius);
    const material = {
      color: 0x08dbea,
      scale: 10,
      flowDirection: new THREE.Vector2(1, 1), // 水纹方向
      textureWidth: 1024,
      textureHeight: 1024
    };
    this.mesh = new Water(geometry, material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.material.fragmentShader = this.mesh.material.fragmentShader.replace(
      `gl_FragColor = vec4( color, 1.0 ) * mix( refractColor, reflectColor, reflectance );`,
      `gl_FragColor = vec4( color, 1.0 ) * mix( refractColor, reflectColor, reflectance );

      // 半经是-1000~1000,
      // 所以vToEye.z也是-1000~1000
      // 得到0~1的值
      float vToEyeZ = vToEye.z * 0.0005 + 0.5;
      gl_FragColor =  mix(gl_FragColor, vec4(0.05, 0.3, 0.7, 1.0), vToEyeZ);
      `
    );
    // console.log(this.mesh.material.fragmentShader);
  }
}
