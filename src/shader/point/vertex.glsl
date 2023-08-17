precision lowp float;

void main(){
    vec4 modelPosition = modelMatrix * vec4( position, 1.0 );
    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position =  projectionMatrix * viewPosition;

    // 92.4 设置点大小
    gl_PointSize = 40.0;
}

