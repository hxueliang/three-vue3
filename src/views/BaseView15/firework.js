import * as THREE from 'three';

import startVertexShader from "../../shader/firework-start/vertex.glsl?raw";
import startFragmentShader from '../../shader/firework-start/fragment.glsl?raw';
import bombVertexShader from "../../shader/firework-bomb/vertex.glsl?raw";
import bombFragmentShader from '../../shader/firework-bomb/fragment.glsl?raw';

// 98.1.1 创建烟花类
export default class Fireworks {
  // 98.3.2 构造函数
  constructor(color, to, from = { x: 0, y: 0, z: 0 }) {

    // 101.1 保存颜色
    this.color = new THREE.Color(color);

    // 98.5.1 创建烟花发射点的几何体
    this.startGeometry = new THREE.BufferGeometry();
    const startPositionArr = new Float32Array([0, 0, 0]);
    this.startGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(startPositionArr, 3)
    );

    // 99.1 计算出起始点到爆炸点的向量，并传给顶点着色器
    const astepArray = new Float32Array([
      to.x - from.x,
      to.y - from.y,
      to.z - from.z
    ]);
    this.startGeometry.setAttribute('astep', new THREE.BufferAttribute(astepArray, 3));

    // 98.5.2 设置着色器材质
    this.startMaterial = new THREE.ShaderMaterial({
      vertexShader: startVertexShader,
      fragmentShader: startFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        // 99.5.1 传参
        uTime: {
          value: 0
        },
        uSize: {
          value: 20
        },
        // 101.2.1 传参
        uColor: {
          value: this.color
        }
      }
    });

    // 98.5.3 创建烟花点球
    this.startPoint = new THREE.Points(
      this.startGeometry,
      this.startMaterial
    );

    // 99.2 创建时钟
    this.clock = new THREE.Clock();

    // 100.1 创建爆炸烟花的几何体
    this.bombGeometry = new THREE.BufferGeometry();
    this.bombCount = 180 + Math.floor(Math.random() * 180);
    const bombPositionArr = new Float32Array(this.bombCount * 3);
    const bombScaleArr = new Float32Array(this.bombCount);
    const bombDirectionArr = new Float32Array(this.bombCount * 3);
    for (let i = 0; i < this.bombCount; i++) {
      // 100.1.1 初始化所有粒子，开始爆炸时的位置
      bombPositionArr[i * 3 + 0] = to.x;
      bombPositionArr[i * 3 + 1] = to.y;
      bombPositionArr[i * 3 + 2] = to.z;
      // 100.1.2 初始化所有粒子的大小
      bombScaleArr[i] = Math.random();
      // 100.1.3 设置四周发射的角度(球面某点的方向)
      const theta = Math.random() * 2 * Math.PI;
      const beta = Math.random() * 2 * Math.PI;
      const r = 1;
      bombDirectionArr[i * 3 + 0] = r * Math.sin(theta) + r * Math.sin(beta);
      bombDirectionArr[i * 3 + 1] = r * Math.cos(theta) + r * Math.cos(beta);
      bombDirectionArr[i * 3 + 2] = r * Math.sin(theta) + r * Math.cos(beta);
    }
    // 100.1.4.1 传参
    this.bombGeometry.setAttribute('position', new THREE.BufferAttribute(bombPositionArr, 3));
    this.bombGeometry.setAttribute('aScale', new THREE.BufferAttribute(bombScaleArr, 1));
    this.bombGeometry.setAttribute('aDirection', new THREE.BufferAttribute(bombDirectionArr, 3));

    // 100.2 创建爆炸烟花的材质
    this.bombMaterial = new THREE.ShaderMaterial({
      vertexShader: bombVertexShader,
      fragmentShader: bombFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        // 100.4.2 传参
        uSize: {
          value: 0
        },
        // 100.5.2 传参
        uTime: {
          value: 0
        },
        // 101.3.1 传参
        uColor: {
          value: this.color
        }
      }
    });

    // 100.3 创建爆炸烟花
    this.bombs = new THREE.Points(this.bombGeometry, this.bombMaterial);

    // 103.1.1 创建音频 爆炸
    this.linstener1 = new THREE.AudioListener();
    this.sound = new THREE.Audio(this.linstener1);
    // 103.1.2 创建音频加载器1
    const audioLoader1 = new THREE.AudioLoader();
    const sendIndex = Math.ceil(Math.random() * 4);
    audioLoader1.load(`./audio/pow${sendIndex}.ogg`, buffer => {
      this.sound.setBuffer(buffer);
      this.sound.setLoop(false);
      this.sound.setVolume(1);
    });

    // 103.2.1 创建音频 移动
    this.linstener2 = new THREE.AudioListener();
    this.sendSound = new THREE.Audio(this.linstener2);
    // 103.2.2 创建音频加载器1
    const audioLoader2 = new THREE.AudioLoader();
    audioLoader2.load(`./audio/send.mp3`, buffer => {
      this.sendSound.setBuffer(buffer);
      this.sendSound.setLoop(false);
      this.sendSound.setVolume(0.13);
      console.log(this.sendSound);
    });

  }

  // 98.4.2 添加到场景
  addScene(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    scene.add(this.startPoint);
    scene.add(this.bombs);
  }

  // 99.3 更新
  update() {
    const elapsedTime = this.clock.getElapsedTime();

    // 103.3 修复音效衔接问题
    if (elapsedTime < 0.2) {
      return;
    }

    if (elapsedTime < 1) {
      // 99.3.1 一秒内
      this.startMaterial.uniforms.uTime.value = elapsedTime;
      this.startMaterial.uniforms.uSize.value = 20;

      // 103.2.3 播放音效
      if (!this.sendSound.isPlaying && !this.sendPlay) {
        this.sendSound.play();
        this.sendPlay = true;
      }
    } else {
      // 99.3.2 超过一秒
      const time = elapsedTime - 1;
      this.startMaterial.uniforms.uSize.value = 0;
      this.startPoint.clear();
      this.startMaterial.dispose();
      this.startMaterial.dispose();

      // 103.1.3 播放音效
      if (!this.sound.isPlaying && !this.play) {
        this.sound.play();
        this.play = true;
      }

      // 100.4.1 设置烟花显示
      this.bombMaterial.uniforms.uSize.value = 20;

      // 100.5.1 设置烟花散开
      this.bombMaterial.uniforms.uTime.value = time;

      // 100.6.2 让烟花消失
      if (time > 5) {
        this.bombs.clear();
        this.bombGeometry.dispose();
        this.bombMaterial.dispose();

        // 102.2.1 移除物体
        this.scene.remove(this.startPoint);
        this.scene.remove(this.bombs);

        // 102.2.2 移除标识
        return 'isRemove';
      }
    }

  }
}