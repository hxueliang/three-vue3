import * as THREE from 'three';
import fragmentShader from './shader/fireSprite/fragment.glsl';

export default class FireSprite {
  constructor(camera, position = new THREE.Vector3(0, 0, 0), scale = 1) {
    this.camera = camera;
    /*
    // 浏览复制字符串，给ShaderMaterial使用
    const material = new THREE.SpriteMaterial({
      map: new THREE.TextureLoader().load('./textures/tag/e.png'),
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    material.onBeforeCompile = shader => {
      console.log(shader.vertexShader); // 浏览复制字符串
    };
    // */

    // /*
    const material = new THREE.ShaderMaterial({
      uniforms: {
        rotation: { value: 0 },
        center: { value: new THREE.Vector2(0.5, 0.5) },

        // 兼容网站复制来的着色器代码
        // https://www.shadertoy.com/view/MlKSWm
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(1000, 1000) },
        iMouse: { value: new THREE.Vector2(0, 0) },
        uFrequency: { value: 0 },
      },
      // 上面复制的字符串，删除修改一些内容，给到vertexShader
      vertexShader: `
      uniform float rotation;
      uniform vec2 center;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
        vec2 scale;
        scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
        scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
        scale *= - mvPosition.z;

        vec2 alignedPosition = -( position.xy - ( center - vec2( 0.5 ) ) ) * scale / mvPosition.z;
        vec2 rotatedPosition;
        rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
        rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
        mvPosition.xy += rotatedPosition;
        gl_Position = projectionMatrix * mvPosition;
        // gl_Position.z = - 10.0; // 配置合Physics.js的createCapsule的相机位置调整
      }
      `,
      fragmentShader,
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    this.material = material;
    // */
    this.mesh = new THREE.Sprite(material);
    this.mesh.position.copy(position);
    this.mesh.scale.set(scale, scale, scale);

    this.addSound();
  }

  addSound() {
    const listener = new THREE.AudioListener();
    this.camera.add(listener);
    const sound = new THREE.PositionalAudio(listener);
    const audioLoader = new THREE.AudioLoader();

    audioLoader.load('./audio/gnzw.mp3', buffer => {
      console.log(buffer);
      sound.setBuffer(buffer);
      sound.setRefDistance(3);
      sound.setLoop(true);
      sound.setVolume(1);
      sound.play();
    });
    this.mesh.add(sound);

    // 分析音频
    this.analyser = new THREE.AudioAnalyser(sound, 32);

  }

  update(time) {
    this.material.uniforms.iTime.value += time;
    const frequency = this.analyser.getAverageFrequency();
    // console.log(frequency);
    this.material.uniforms.uFrequency.value = frequency;
  }
}