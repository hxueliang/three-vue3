precision lowp float;

varying vec2 vUv;

void main(){
    vec4 modelPosition = modelMatrix * vec4( position, 1.0 );
    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position =  projectionMatrix * viewPosition;

    vUv = uv;

    // 92.4 设置点大小
    gl_PointSize = 100.0;
}

