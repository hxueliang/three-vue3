precision lowp float;

varying vec2 vUv;

varying float vImgIndex;

varying vec3 vColor;

// 92.3.2 接收sampler2D类型
uniform sampler2D uTexture;
// 94.2.4 再接收两个新的纹理
uniform sampler2D uTexture2;
uniform sampler2D uTexture3;

void main(){
    // 92.1.1 点材质，一个图形只是一个点，不能用uv坐标，无法uv
    // gl_FragColor = vec4(vUv, 0.0, 1);

    // 92.1.2 可以使用，像素的坐标替代 (y轴方向与uv的y轴方向相反)
    // gl_FragColor = vec4(gl_PointCoord, 0.0, 1);


    // 92.2.1 设置渐变圆
    // float strength = 1.0 - distance(gl_PointCoord, vec2(0.5));
    // gl_FragColor = vec4(strength);

    // 92.2.2 设置圆
    // float strength = 1.0 - distance(gl_PointCoord, vec2(0.5));
    // strength = step(0.5,strength);
    // gl_FragColor = vec4(strength);

    // 92.2.3 设置星星
    // float strength = distance(gl_PointCoord, vec2(0.5));
    // strength *= 2.0;
    // strength = 1.0 - strength;
    // gl_FragColor = vec4(strength);


    // 92.3.3 根据纹理设置图案
    // vec4 textureColor = texture2D(uTexture, gl_PointCoord);
    // gl_FragColor = vec4(textureColor.rgb, textureColor.r);

    // 92.3.4 根据纹理设置图案，上色
    // vec4 textureColor = texture2D(uTexture, gl_PointCoord);
    // gl_FragColor = vec4(gl_PointCoord, 1.0,textureColor.r);

    // 94.2.5 使用多个纹理
    vec4 textureColor;
    if(vImgIndex == 0.0) {
        textureColor = texture2D(uTexture, gl_PointCoord);
    } else if(vImgIndex == 1.0) {
        textureColor = texture2D(uTexture2, gl_PointCoord);
    } else {
        textureColor = texture2D(uTexture3, gl_PointCoord);
    }
    
    // gl_FragColor = vec4(gl_PointCoord, 1.0,textureColor.r);

    // 97.3 使用vColor
    gl_FragColor = vec4(vColor,textureColor.r);
}