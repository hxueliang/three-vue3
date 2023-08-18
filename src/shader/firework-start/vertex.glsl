precision lowp float;

// 99.2 接收js传过来的参数
attribute vec3 astep;

// 99.5.2 接参
uniform float uTime;
uniform float uSize;

void main(){
    vec4 modelPosition = modelMatrix * vec4( position, 1.0 );

    // 99.6 移动点
    modelPosition.xyz += astep * uTime;

    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position =  projectionMatrix * viewPosition;

    // 99.7 控制点大小
    gl_PointSize = uSize;
}

