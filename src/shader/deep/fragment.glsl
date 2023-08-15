precision lowp float;

varying vec2 vUv;

uniform float uFrequency;
uniform float uScale;
uniform float uTime;

// 88.4.2 定义常量PI
#define PI 3.1415926535897932384626433832795

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

// 88.6.1 噪声函数
// https://thebookofshaders.com/13/?lan=ch
float noise (in vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  // Four corners in 2D of a tile
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) +
    (c - a)* u.y * (1.0 - u.x) +
    (d - b) * u.x * u.y;
}


// 88.7.1.2 噪声函数2
vec4 permute(vec4 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}
vec2 fade(vec2 t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}
float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
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
  // vec2 rotateUv = rotate(vUv, -uTime * 5.0, vec2(0.5));  // vec2(0.5)两个参数值一样可以只写的个
  // float strength = 0.15 / distance(vec2(rotateUv.x, (rotateUv.y - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // strength += 0.15 / distance(vec2(rotateUv.y, (rotateUv.x - 0.5) * 5.0 + 0.5), vec2(0.5, 0.5)) - 1.0;
  // gl_FragColor = vec4(strength, strength, strength, strength);



  // 88.1.1 圆心渐变 distance()
  // float strength = distance(vUv, vec2(0.5));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.1.2 圆(不渐变) step(0.5,distance());
  // float strength = step(0.5, distance(vUv, vec2(0.5)));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.1.3 圆(不渐变，减小半径) step(0.5,distance()+0.25);
  // float strength = step(0.5, distance(vUv, vec2(0.5)) + 0.25);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.1.4 圆(黑白互换)
  // float strength = 1.0 - step(0.5, distance(vUv, vec2(0.5)) + 0.25);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.1.5 圆环，第3步(减少半径) * 第4步
  // float strength = step(0.5, distance(vUv, vec2(0.5)) + 0.35);
  // strength *= 1.0 - step(0.5, distance(vUv, vec2(0.5)) + 0.25);
  // gl_FragColor = vec4(strength, strength, strength, 1);


  // 88.2.1 渐变圆环 abs(distance()-0.25)
  // float strength = abs(distance(vUv, vec2(0.5)) - 0.25);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.2.2 圆环(不渐变) step(0.1,abs(distance()-0.25))
  // float strength = step(0.1, abs(distance(vUv, vec2(0.5)) - 0.25));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.2.3 圆环(黑白互换)
  // float strength = 1.0 - step(0.1, abs(distance(vUv, vec2(0.5)) - 0.25));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.2.4 圆环(减小环的粗度)
  // float strength = 1.0 - step(0.01, abs(distance(vUv, vec2(0.5)) - 0.25));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.2.5 波浪圆环(y值随意)
  // vec2 waveUv = vec2(
  //   vUv.x,
  //   vUv.y + sin(vUv.x * 30.0) * 0.1
  // );
  // float strength = 1.0 - step(0.01, abs(distance(waveUv, vec2(0.5)) - 0.25));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.2.6 波浪圆环(xy值随意)
  // vec2 waveUv = vec2(
  //   vUv.x + sin(vUv.y * 30.0) * 0.1,
  //   vUv.y + sin(vUv.x * 30.0) * 0.1
  // );
  // float strength = 1.0 - step(0.01, abs(distance(waveUv, vec2(0.5)) - 0.25));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.2.7 波浪圆环(动起来)
  // vec2 waveUv = vec2(
  //   vUv.x + sin(vUv.y * 30.0 * uTime) * 0.1,
  //   vUv.y + sin(vUv.x * 30.0 * uTime) * 0.1
  // );
  // float strength = 1.0 - step(0.01, abs(distance(waveUv, vec2(0.5)) - 0.25));
  // gl_FragColor = vec4(strength, strength, strength, 1);


  // 88.3.1 根据角度，显示视图，反正切函数
  // float angle = atan(vUv.x, vUv.y);
  // float strength = angle;
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.3.2 根据角度，实现螺旋渐变(方形)
  // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
  // float strength = (angle + 3.14) / 6.28;
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.3.3 根据角度，实现螺旋渐变(圆形)
  // 88.3.3.1 借用 88.1.4 圆，来做透明度
  // float alpha = 1.0 - step(0.5, distance(vUv, vec2(0.5)) + 0.25);
  // float angle = atan(vUv.x - 0.5, vUv.y - 0.5);
  // float strength = (angle + 3.14) / 6.28;
  // gl_FragColor = vec4(strength, strength, strength, alpha);

  // 88.3.4 根据角度，实现雷达扫射
  // 88.3.4.1 借用 87.10.12 实现旋转
  // vec2 rotateUv = rotate(vUv, -uTime * 5.0, vec2(0.5));
  // float alpha = 1.0 - step(0.5, distance(vUv, vec2(0.5)) + 0.25);
  // float angle = atan(rotateUv.x - 0.5, rotateUv.y - 0.5);
  // float strength = (angle + 3.14) / 6.28;
  // gl_FragColor = vec4(strength, strength, strength, alpha);


  // 88.4.1 根据角度，实现万花筒
  // float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (2.0 * PI);
  // float strength = mod(angle * 10.0, 1.0);
  // gl_FragColor = vec4(strength, strength, strength, 1);


  // 88.5 根据角度，实现光芒四射
  // float angle = atan(vUv.x - 0.5, vUv.y - 0.5) / (2.0 * PI);
  // float strength = sin(angle * 100.0);
  // gl_FragColor = vec4(strength, strength, strength, 1);


  // 88.6.2 实现烟雾/波纹，噪声函数
  // float strength = noise(vUv);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.6.3 实现烟雾/波纹，噪声函数xy*系数
  // float strength = noise(vUv * 10.0);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.6.4 实现烟雾/波纹，step(0.5,噪声函数xy*系数)
  // float strength = step(0.5, noise(vUv * 10.0));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.6.5 实现烟雾/波纹，gui调试，step(uScale,噪声函数xy*系数)
  // float strength = step(uScale, noise(vUv * 10.0));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.6.5 实现烟雾/波纹，时间控制，step(uScale,噪声函数xy*系数+uTime)
  // float strength = step(uScale, noise(vUv * 10.0 + uTime));
  // gl_FragColor = vec4(strength, strength, strength, 1);


  // 88.7.1.1 实现小路环绕，新的噪声函数
  // float strength = abs(cnoise(vUv * 10.0));
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.7.2 实现豹纹
  // float strength = sin(cnoise(vUv * 10.0) * 30.0);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.7.3 实现水波纹
  // float strength = sin(cnoise(vUv * 10.0) * 30.0 + uTime * 2.0);
  // gl_FragColor = vec4(strength, strength, strength, 1);

  // 88.7.4 实现豹纹，不要渐变
  // float strength = step(0.9, sin(cnoise(vUv * 10.0) * 30.0));
  // gl_FragColor = vec4(strength, strength, strength, 1);


  // 88.8.1 使用混合函数，混合颜色
  // vec3 blackColor = vec3(0.0, 0.0, 0.0);
  // vec3 yellowColor = vec3(1.0, 1.0, 0.0);
  // float strength = step(0.9, sin(cnoise(vUv * 10.0) * 30.0));
  // vec3 mixColor = mix(blackColor,yellowColor, strength);
  // gl_FragColor = vec4(mixColor, 1);

  // 88.8.2 使用混合函数，混合vUv颜色
  // vec3 uvColor = vec3(1.0, vUv);
  // gl_FragColor = vec4(uvColor, 1);

  // 88.8.3 使用混合函数
  vec3 blackColor = vec3(0.0, 0.0, 0.0);
  vec3 yellowColor = vec3(1.0, 1.0, 0.0);
  vec3 uvColor = vec3(1.0, vUv);
  float strength = step(0.9, sin(cnoise(vUv * 10.0) * 30.0));
  vec3 mixColor = mix(uvColor,yellowColor, strength);
  gl_FragColor = vec4(mixColor, 1);
}