precision lowp float;

varying vec4 vPosition;
varying vec4 gPosition;

void main(){
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength *= 2.0;
    strength = 1.0 - strength;
    gl_FragColor = vec4(1, 0, 0,strength);
}