precision lowp float;

varying vec4 vPosition;
varying vec4 gPosition;

// 101.3.2 接参
uniform vec3 uColor;

void main(){
    float strength = distance(gl_PointCoord, vec2(0.5));
    strength *= 2.0;
    strength = 1.0 - strength;

    // 101.3.3 设置爆炸烟花颜色
    gl_FragColor = vec4(uColor,strength);
}