precision lowp float;

varying vec2 vUv;

// 92.3.2 接收sampler2D类型
uniform sampler2D uTexture;

void main(){
    // 92.1.1 点材质，一个图形只是一个点，不能用uv坐标，无法用了着色
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
    vec4 textureColor = texture2D(uTexture, gl_PointCoord);
    gl_FragColor = vec4(gl_PointCoord, 1.0,textureColor.r);
}