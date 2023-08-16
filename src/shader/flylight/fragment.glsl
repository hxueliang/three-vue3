precision lowp float;

varying vec4 vPosition;
varying vec4 gPosition;

void main(){
    vec4 redColor = vec4(1, 0, 0, 1);
    vec4 yellowColor = vec4(1, 1, 0.5, 1);
    vec4 mixColor = mix(yellowColor, redColor, gPosition.y / 3.0);
    
    
    // 外面
    if(gl_FrontFacing) {
        // 原色 - 模型最终的高度 - 外面暗点
        gl_FragColor = vec4(mixColor.rgb - (vPosition.y - 20.0) / 100.0 - 0.1, 1);
    } else {
        // 原色
        gl_FragColor = vec4(mixColor.rgb, 1);
    }
}