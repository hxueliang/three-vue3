precision lowp float;

// 90.5.3 顶点着色器传过来的，海拔高度
varying float vElevation;

uniform vec3 uLowColor;
uniform vec3 uHighColor;
uniform float uOpacity;

void main(){
    // 90.5.4 利用海拔设置颜色
    float elevation = (vElevation + 1.0) / 2.0;
    vec3 mixColor = mix(uLowColor,uHighColor, elevation);
    gl_FragColor = vec4(mixColor, uOpacity);
}