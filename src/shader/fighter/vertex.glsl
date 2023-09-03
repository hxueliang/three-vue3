attribute vec3 aPosition;

uniform float uTime;

void main(){
    vec4 modelPosition = modelMatrix * vec4( position, 1.0 );

    // 方向 = 终点位置 - 始点位置
    vec3 direction = aPosition - modelPosition.xyz;
    // 目标位置 = 始点位置 + 文向 * 时间 * 自己调整的系数
    vec3 targetPosition = modelPosition.xyz + direction * uTime * 0.1;
    // 使用目标位置
    vec4 viewPosition = viewMatrix * vec4(targetPosition, 1.0);

    gl_Position =  projectionMatrix * viewPosition;

    // gl_PointSize = 50.0;
    // 设置近大远小
    gl_PointSize = -50.0 / viewPosition.z;
}