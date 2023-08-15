precision lowp float;

varying vec2 vUv;

uniform float uTime;

// 87.9.0 随机函数
// https://thebookofshaders.com/10/?lan=ch
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// 87.10.11 旋转函数
vec2 rotate(vec2 uv, float rotation, vec2 mid) {
  return vec2(
    cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
    cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
  );
}


void main(){
  // 87.1 默认b为0效果
  // gl_FragColor = vec4(vUv, 0.0, 1);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.2 默认b为1效果
  // gl_FragColor = vec4(vUv, 1, 1);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.3 利用uv实现渐变效果
  // float strength = vUv.x;
  // float strength = 1.0 - vUv.x;
  // float strength = vUv.y;
  // float strength = 1.0 - vUv.y;
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.4 变化的剧烈些（乘）
  // float strength = vUv.x * 10.0;
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.5 反复渐变（取模）
  // float strength = mod(vUv.x * 10.0, 1.0);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.6.1 黑白条纹，step(edge, x)，如果 x < edge 返回0.0，否则返回1.0
  // float strength = mod(vUv.x * 10.0, 1.0);
  // strength = step(0.5, strength);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.6.2 黑白条纹，修改黑白条纹的占比
  // float strength = mod(vUv.x * 10.0, 1.0);
  // strength = step(0.4, strength);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.6.3 黑白条纹，实现黑色小方格子，条纹相加
  // float strength = step(0.4, mod(vUv.x * 10.0, 1.0));
  // strength += step(0.4, mod(vUv.y * 10.0, 1.0));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.6.4 黑白条纹，实现白色小方格子，条纹相乘
  // float strength = step(0.4, mod(vUv.x * 10.0, 1.0));
  // strength *= step(0.4, mod(vUv.y * 10.0, 1.0));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.6.5.1 黑白条纹，实现7字格子，条纹相乘再相相加
  // float barX = step(0.2, mod(vUv.x * 10.0, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
  // float barY = step(0.2, mod(vUv.y * 10.0, 1.0)) * step(0.8, mod(vUv.x * 10.0, 1.0));
  // float strength = barX + barY;
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.6.5.2 黑白条纹，实现彩色7字格子，条纹相乘再相相加
  // float barX = step(0.2, mod(vUv.x * 10.0, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
  // float barY = step(0.2, mod(vUv.y * 10.0, 1.0)) * step(0.8, mod(vUv.x * 10.0, 1.0));
  // float strength = barX + barY;
  // gl_FragColor = vec4(vUv, 1, strength);

  // 87.6.5.3 黑白条纹，实现T字格子，条纹相乘再相相加，再减x
  // float barX = step(0.2, mod(vUv.x * 10.0 - 0.3, 1.0)) * step(0.8, mod(vUv.y * 10.0, 1.0));
  // float barY = step(0.2, mod(vUv.y * 10.0, 1.0)) * step(0.8, mod(vUv.x * 10.0, 1.0));
  // float strength = barX + barY;
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.7.1 右边黑到的白，左边全黑，减0.5
  // float strength = vUv.x - 0.5;
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.7.2 右边黑到的白，左边镜向，减0.5，取绝对值
  // float strength = abs(vUv.x - 0.5);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.7.3 右边黑到的白，宽十字效果，取x,y最小值
  // float strength = min(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.7.4 右边黑到的白，窄十字效果，取x,y最大值
  // float strength = max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.7.4 右边黑到的白，窄十字效果，中间亮，1 - 取x,y最大值，
  // float strength = 1.0 - max(abs(vUv.x - 0.5), abs(vUv.y - 0.5));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.7.5 右边黑到的白，中黑回字效果，step(0.2, 取x,y最大值)，
  // float strength = step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.7.6 右边黑到的白，中白回字效果，1 -step(0.2, 取x,y最大值)，
  // float strength = 1.0 - step(0.2, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.8.1 阶段性条纹渐变，向下or向上取整
  // float twWidth = 10.0;
  // float strength = floor(vUv.x * twWidth) / twWidth;
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.8.2 阶段性条纹渐变，格子渐变，向下or向上取整，xy乘
  // float twWidth = 10.0;
  // float barX = floor(vUv.x * twWidth) / twWidth;
  // float barY = floor(vUv.y * twWidth) / twWidth;
  // float strength = barX * barY;
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.9.1 电视雪花效果，随机函数
  // float strength = random(vUv);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.9.2 随机网格效果
  // float twWidth = 10.0;
  // float barX = ceil(vUv.x * twWidth) / twWidth;
  // float barY = ceil(vUv.y * twWidth) / twWidth;
  // float strength = barX * barY;
  // strength = random(vec2(strength, strength));
  // gl_FragColor = vec4(strength, strength, strength, strength);

  // 87.10.1 圆心(uv的原点)渐变，length(x)，返回向量x的长度
  // float strength = length(vUv);
  // gl_FragColor = vec4(strength, strength, strength, strength);

  // 87.10.2 圆心(指定的点)渐变，distance(p0, p1)，计算向量p0，p1之间的距离
  // float strength = distance(vUv, vec2(0.5, 0.5));
  // gl_FragColor = vec4(strength, strength, strength, strength);

  // 87.10.3 圆心(指定的点)渐变，中间亮，1-
  // float strength = 1.0 - distance(vUv, vec2(0.5, 0.5));
  // gl_FragColor = vec4(strength, strength, strength, strength);

  // 87.10.4 圆心(指定的点)渐变，中间大亮，小值/
  // float strength = 0.15 / distance(vUv, vec2(0.5, 0.5));
  // gl_FragColor = vec4(strength, strength, strength, strength);

  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 87.10.5 圆心(指定的点)渐变，中间大亮，四周黑，小值/，透明度
  // float strength = 0.15 / distance(vUv, vec2(0.5, 0.5)) - 1.0;
  // gl_FragColor = vec4(strength, strength, strength, strength);

  // 87.10.6 圆心(指定的点)渐变，拉申某个方向，方向*
  // float strength = 0.15 / distance(vec2(vUv.x, vUv.y * 5.0), vec2(0.5, 0.5)) - 1.0;
  // gl_FragColor = vec4(strength, strength, strength, strength);

  // 87.10.7 圆心(指定的点)渐变，偏移某个方向，方向-
  // float strength = 0.15 / distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0), vec2(0.5, 0.5)) - 1.0;
  // gl_FragColor = vec4(strength, strength, strength, strength);

  // 87.10.8 圆心(指定的点)渐变，偏移某个方向加回偏移量，方向-
  // float strength = 0.15 / distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // gl_FragColor = vec4(strength, strength, strength, strength);

  // 87.10.9 圆心(指定的点)渐变，偏移某个方向加回偏移量(十字星效果)，方向-，xy互换相乘
  // float strength = 0.15 / distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // strength *= 0.15 / distance(vec2(vUv.y, (vUv.x - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // gl_FragColor = vec4(strength, strength, strength, strength);

  // 87.10.10 圆心(指定的点)渐变，偏移某个方向加回偏移量(十字星效果)，方向-，xy互换相加
  // float strength = 0.15 / distance(vec2(vUv.x, (vUv.y - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // strength += 0.15 / distance(vec2(vUv.y, (vUv.x - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // gl_FragColor = vec4(strength, strength, strength, strength);

  // 87.10.12 旋转星星45度，即旋转uv
  // vec2 rotateUv = rotate(vUv, 3.14 / 4.0, vec2(0.5));  // vec2(0.5)两个参数值一样可以只写的个
  // float strength = 0.15 / distance(vec2(rotateUv.x, (rotateUv.y - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // strength += 0.15 / distance(vec2(rotateUv.y, (rotateUv.x - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // gl_FragColor = vec4(strength, strength, strength, strength);

  // 87.10.12 旋转星星45度，即旋转uv
  vec2 rotateUv = rotate(vUv, -uTime * 5.0, vec2(0.5));  // vec2(0.5)两个参数值一样可以只写的个
  float strength = 0.15 / distance(vec2(rotateUv.x, (rotateUv.y - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  strength += 0.15 / distance(vec2(rotateUv.y, (rotateUv.x - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  gl_FragColor = vec4(strength, strength, strength, strength);
}