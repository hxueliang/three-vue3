// 85.2.3.5 设置浮点数数度 
precision lowp float;

// 85.2.3.3 接收顶点着色器传过来的值
varying vec2 vUv;

void main(){
  // 85.2 查看页面，看了一个四个顶点颜色为黑红黄绿的正方形
  // 是由 第一个参数vUv(含r/g两个值)
  // 和 第二的参数0.0(即b)决定顶点的颜色
  gl_FragColor = vec4(vUv, 0.0, 1.0);
}