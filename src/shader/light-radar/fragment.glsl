varying vec2 vUv;
uniform float uTime;
uniform vec3 uColor;

#define PI 3.1415926535897932384626433832795

// 旋转函数
vec2 rotate(vec2 uv, float rotation, vec2 mid) {
  return vec2(
    cos(rotation) * (uv.x - mid.x) + sin(rotation) * (uv.y - mid.y) + mid.x,
    cos(rotation) * (uv.y - mid.y) - sin(rotation) * (uv.x - mid.x) + mid.y
  );
}

void main(){
  vec2 rotateUv = rotate(vUv, -uTime * 5.0, vec2(0.5));
  float alpha = 1.0 - step(0.5, distance(vUv, vec2(0.5)) + 0.25);
  float angle = atan(rotateUv.x - 0.5, rotateUv.y - 0.5);
  float strength = (angle + PI) / (2.0 * PI);
  
  gl_FragColor = vec4(uColor, alpha * strength);
}