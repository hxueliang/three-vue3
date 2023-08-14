// 85.2.3.4 设置浮点数数度 
// hight: -2^16 - 2^16  mediump: -2^10 - 2^10  lowp: -2^8 - 2^8
precision lowp float;

// 85.2.1 Attributes是每个顶点独一无二的变量
attribute vec3 position;
attribute vec2 uv;

// 85.2.2 Uniforms是所有顶点都具有相同的值的变量
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

// 85.2.3.1 Varyings是从顶点着色器传递到片元着色器的变量
varying vec2 vUv; // v前缀，代表变量是vertex传过来的变量，习惯用法

void main(){
  // 85.2.3.2 把uv的值传给vUv
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
}