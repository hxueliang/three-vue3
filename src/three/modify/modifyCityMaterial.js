import * as THREE from 'three';
import gsap from "gsap";

export default function modifyCityMaterial(mesh) {
  mesh.material.onBeforeCompile = shader => {
    console.log(shader.vertexShader);
    console.log(shader.fragmentShader);
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <dithering_fragment>`,
      `#include <dithering_fragment>
      //#end#
        `
    );
    addGradualColor(shader, mesh);
    addSpread(shader);
  };
}

// 给模型添加渐变色
function addGradualColor(shader, mesh) {
  const { geometry } = mesh;
  geometry.computeBoundingBox();
  const { max, min } = geometry.boundingBox;
  const uHeight = max.y - min.y;

  shader.uniforms.uHeight = { value: uHeight };
  shader.uniforms.uTopColor = { value: new THREE.Color(0xaaaaff) };
  shader.vertexShader = shader.vertexShader.replace(
    `#include <common>`,
    `#include <common>
      varying vec3 vPosition;
      `
  );
  shader.vertexShader = shader.vertexShader.replace(
    `#include <begin_vertex>`,
    `#include <begin_vertex>
      vPosition = position;
      `
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    `#include <common>`,
    `#include <common>
      varying vec3 vPosition;
      uniform float uHeight;
      uniform vec3 uTopColor;
      `
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    `//#end#`,
    `
      vec4 distGradualColor = gl_FragColor;
      float gradualMix = (vPosition.y + uHeight / 2.0) / uHeight;
      vec3 gradualColor = mix(distGradualColor.xyz, uTopColor, gradualMix);

      gl_FragColor = vec4(gradualColor, 1);
      //#end#
      `
  );
}

// 添加扩散特效
function addSpread(shader) {
  shader.uniforms.uSpreadCenter = { value: new THREE.Vector2(0, 0) };
  shader.uniforms.uSpreadTime = { value: 0 };
  shader.uniforms.uSpreadWidth = { value: 40 };

  shader.fragmentShader = shader.fragmentShader.replace(
    `#include <common>`,
    `#include <common>
      uniform vec2 uSpreadCenter;
      uniform float uSpreadTime;
      uniform float uSpreadWidth;
      `
  );
  shader.fragmentShader = shader.fragmentShader.replace(
    `//#end#`,
    `
      float spreadRaidus = distance(vPosition.xz, uSpreadCenter);
      // 扩散范围函数
      float r = spreadRaidus - uSpreadTime;
      float spreadIndex = -r * r + uSpreadWidth;

      if(spreadIndex > 0.0) {
        gl_FragColor = mix(gl_FragColor, vec4(1,1,1,1), spreadIndex / uSpreadWidth);
      }
      
      //#end#
      `
  );
  gsap.to(shader.uniforms.uSpreadTime, {
    value: 800,
    duration: 2,
    ease: 'none',
    repeat: -1,
  });
}