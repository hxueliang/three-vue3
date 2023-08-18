precision lowp float;

// 100.4.3 接参
attribute float aScale;
// 100.5.3 接参
attribute vec3 aDirection;

// 100.4.3 接参
uniform float uTime;
uniform float uSize;

void main(){
    vec4 modelPosition = modelMatrix * vec4( position, 1.0 );

    // 100.5.4 设置方向，让烟花散开
    modelPosition.xyz += aDirection * uTime * 2.0;

    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position =  projectionMatrix * viewPosition;

    // 100.4.4 设置大小，让烟花显示
    // gl_PointSize = uSize * aScale;

    // 100.6.1 变小，让烟花消失
    gl_PointSize = uSize * aScale - (uTime * 10.0);
}

