precision lowp float;

varying vec2 vUv;

// 94.2.3.2 接收js传过的vImgIndex
attribute float imgIndex;

varying float vImgIndex;

void main(){
    vec4 modelPosition = modelMatrix * vec4( position, 1.0 );
    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position =  projectionMatrix * viewPosition;

    vUv = uv;

    // 94.2.3.3 传值给片元着色器
    vImgIndex = imgIndex;

    // 92.4 设置点大小
    gl_PointSize = 40.0;
}

