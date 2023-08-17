precision lowp float;

varying vec2 vUv;

// 94.2.3.2 接收js传过的vImgIndex
attribute float imgIndex;

varying float vImgIndex;

// 96.1.2 接收uTime
uniform float uTime;

void main(){
    vec4 modelPosition = modelMatrix * vec4( position, 1.0 );

    // 96.2.1 获取角度
    float angle = atan(modelPosition.x, modelPosition.z);
    // 96.2.2 获取顶点到中心的距离
    float distanceToCenter = length(modelPosition.xz);
    // 96.2.3 根据距离设置偏移度数
    float angleOfset = 1.0 / distanceToCenter * uTime;
    // 96.2.4 计算先新的角度
    angle += angleOfset;
    // 96.2.5 设置新的xz
    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;

    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position =  projectionMatrix * viewPosition;
    vUv = uv;

    // 94.2.3.3 传值给片元着色器
    vImgIndex = imgIndex;

    // 92.4 设置点大小
    // gl_PointSize = 40.0;

    // 95.1 根据viewPosition设置物体大小
    gl_PointSize = 200.0 / -viewPosition.z;

}

