import * as THREE from 'three';

export default function WallShaderMaterial(panorama) {
  const [point] = panorama.point;
  const url = point.panoramaUrl.replace('/assets', '/imgs/room720');
  const panaramaTexture = new THREE.TextureLoader().load(url);
  // 纹理在上传到GPU时沿着垂直轴不翻转
  panaramaTexture.flipY = false;
  // 水平、垂直都可以重复
  panaramaTexture.wrapS = THREE.RepeatWrapping;
  panaramaTexture.wrapT = THREE.RepeatWrapping;
  // 中心点，即相机拍这幅全场图时的位置，数据yz要互换
  const center = new THREE.Vector3(point.x / 100, point.z / 100, point.y / 100);
  return new THREE.ShaderMaterial({
    uniforms: {
      uPanorama: { value: panaramaTexture },
      uCenter: { value: center },
    },
    vertexShader: `
      varying vec2 vUv;
      uniform vec3 uCenter;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vec4 modelpos = modelMatrix * vec4(position, 1.0);
        vPosition = modelpos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform sampler2D uPanorama;
      uniform vec3 uCenter;
      varying vec3 vPosition;
      const float PI = 3.14159265359;
      
      void main() {
        // normalize: 归一化向量
        vec3 nPos = normalize(vPosition - uCenter);
        // 通过反三角函数得到角度，并除以PI，得到0~1的值
        float theta = acos(nPos.y) / PI;
        // [-PI,PI] + PI => [0, 2PI] / 2PI => [0, 1]
        float phi = (atan(nPos.z, nPos.x) + PI) / (2.0 * PI);
        // 全境图的颜色采样
        vec4 pColor = texture2D(uPanorama, vec2(phi, theta));

        gl_FragColor = pColor;

      }
    `
  });
}