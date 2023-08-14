// 85.2.3.5 设置浮点数数度 
precision lowp float;

// 85.2.3.3 接收顶点着色器传过来的值
varying vec2 vUv;

// 86.3.3 定义高度参数
varying float vElevation;

// 86.5.3 加载纹理
uniform sampler2D uTextrue;

void main(){
  // 85.2 查看页面，看了一个四个顶点颜色为黑红黄绿的正方形
  // 是由 第一个参数vUv(含r/g两个值)
  // 和 第二的参数0.0(即b)决定顶点的颜色
  // gl_FragColor = vec4(vUv, 0.0, 1.0);

  // 86.3.1 修改为红色，方便查看高矮处，颜色差异
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

  // 86.3.4 vElevation传过来的是-0.05 - 0.05，把他转为0.0 - 1.0
  //  float height = vElevation + 0.05 * 10.0;
  //  gl_FragColor = vec4(1.0 * height, 0.0, 0.0, 1.0);

  // 86.5.4 根据uv，取出对应的颜色
  vec4 textureColor = texture2D(uTextrue, vUv);
  float height = vElevation + 0.05 * 10.0;
  // 86.5.5 乘上height，设置深浅色
  textureColor.rbg *= height;
  gl_FragColor = textureColor;
}