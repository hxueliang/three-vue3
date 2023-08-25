varying vec3 vPosition;
uniform float uHeight;
uniform vec3 uColor;

void main(){
  float gradualMix = (vPosition.y + uHeight / 2.0) / uHeight;

  gl_FragColor = vec4(uColor, 1.0 - gradualMix);
}