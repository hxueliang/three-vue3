uniform vec3 uColor;
uniform sampler2D uTexture;

void main(){
    vec4 textureColor = texture2D(uTexture, gl_PointCoord);

    // gl_FragColor = textureColor;
    // 因为颜色要传进来，所以只需要拿纹理的其中一个颜色做透明度就行
    gl_FragColor = vec4(uColor, textureColor.r);
}