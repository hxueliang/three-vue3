attribute float aSize;

uniform float uTime;
uniform vec3 uColor;
uniform float uLength;
uniform float uScale;

varying float vSize;

void main(){
  vec4 viewPosition = viewMatrix * modelMatrix * vec4( position, 1.0 );
  gl_Position = projectionMatrix * viewPosition;
  
  vSize = aSize - uTime;
  if(vSize < 0.0) {
    vSize = vSize + uLength;
  }
  vSize = (vSize - 500.0) * uScale;

  gl_PointSize = -vSize / viewPosition.z;
}