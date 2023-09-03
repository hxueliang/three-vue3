void main(){
    vec4 modelPosition = modelMatrix * vec4( position, 1.0 );

    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position =  projectionMatrix * viewPosition;

    // gl_PointSize = 50.0;
    // 设置近大远小
    gl_PointSize = -50.0 / viewPosition.z;
}
