import * as THREE from 'three';

import { Capsule } from 'three/examples/jsm/math/Capsule.js';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const gltfLoader = new GLTFLoader();

// 可以循环做的动作
const loopArr = ['Idle', 'Running', 'Walking'];
// 按键状态
const keyStates = {
  'w': false,
  'a': false,
  's': false,
  'd': false,
  ' ': false,
  'isDown': false,
  'v': false,
};



export default class Physics {
  constructor(planeGroup, scene, camera) {
    this.scene = scene;
    this.camera = camera;
    // 激活的相机
    this.activeCamera = camera;
    // 动作混合器
    this.mixer = null;
    // 动画map
    this.actions = {};
    // 激活的动作
    this.activeAction = null;
    // 设置重力
    this.gravity = -9.8;
    // 玩家速度
    this.playerVelocity = new THREE.Vector3(0, 0, 0);
    // 玩家方向
    this.playerDirection = new THREE.Vector3(0, 0, 0);
    // 玩家是否在地面上
    this.playerOnFloor = false;
    // 创建一个人的碰撞体（胶囊形）
    this.playerCollider = new Capsule(
      new THREE.Vector3(0, 0.35, 0),
      new THREE.Vector3(0, 1.35, 0),
      0.35
    );
    // 
    this.eventPositionList = [];

    this.createBackCamera(0, 5, -10);

    this.createCapsule();
    this.createRobot();
    this.cerateOctree(planeGroup);

    this.initKeyEvent();
    this.initMouseMoveEvent();
    this.initMouseDownEvent();

  }

  // 创建后背相机
  createBackCamera(x = 0, y = 10, z = -50) {
    this.backCamera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.000001,
      10000
    );
    this.backCamera.position.set(x, y, z);
    this.scene.add(this.backCamera);
  }

  // 创建一个胶囊物体
  createCapsule() {
    this.capsule = new THREE.Object3D();
    this.capsule.position.set(0, (0.35 + 1 + 0.35) / 2, 0);
    // 实现相机跟随胶囊移动
    // 将相机作为胶囊的子元素
    this.camera.position.set(0, 4, -10); // 顶点着色器z轴也要按这里的z值调整
    this.camera.lookAt(this.capsule.position);
    this.backCamera.position.set(0, 4, 10);
    this.backCamera.lookAt(this.capsule.position);
    // 创建空物体，创建相机的上下方向
    // 胶囊-空物体-相机
    this.emptyMesh = new THREE.Object3D();
    this.emptyMesh.add(this.camera);
    this.emptyMesh.add(this.backCamera);
    this.capsule.add(this.emptyMesh);
    // 控制器设置中心为胶囊位置
    this.controls && (this.controls.target = this.capsule.position);

    this.scene.add(this.capsule);
  }

  // 创建机器人
  createRobot() {
    gltfLoader.load('./model/metaverse/robotExpressive.glb', gltf => {
      const { animations, scene: robotScene } = gltf;
      this.robot = robotScene;
      this.robot.scale.set(0.5, 0.5, 0.5);
      this.robot.position.set(0, -0.75, 0);
      this.capsule.add(this.robot); // 做为胶囊的子物体

      this.mixer = new THREE.AnimationMixer(this.robot);
      animations.forEach(animation => {
        const { name } = animation;
        this.actions[name] = this.mixer.clipAction(animation);
        if (loopArr.includes(name)) {
          this.actions[name].clampWhenFinished = false;
          this.actions[name].loop = THREE.LoopRepeat;
        } else {
          this.actions[name].clampWhenFinished = true; // 动画将在最后一帧之后自动暂停
          this.actions[name].loop = THREE.LoopOnce; // 执行一次
        }
      });
      this.activeAction = this.actions['Idle'];
      this.activeAction.play();
    });
  }

  // 创建八叉树，用于碰撞检测组
  cerateOctree(planeGroup) {
    this.scene.add(planeGroup);

    this.worldOctree = new Octree();
    this.worldOctree.fromGraphNode(planeGroup);
  }

  // 更新玩家数据
  updatePlayer(deltaTime) {
    // 阻尼，可以理解为胶囊与地面的摩擦系数
    let damping = -0.28;
    if (this.playerOnFloor) {
      // 如果玩家已经在地面上，让下降速度重置为0
      this.playerVelocity.y = 0;
      // 停止键按的时，设置摩擦力，让胶囊自己停下来
      // addScaledVector将所传入的向量v与标量s相乘，所得的乘积和这个向量相加
      keyStates.isDown || this.playerVelocity.addScaledVector(this.playerVelocity, damping);
    } else {
      // 否则，下降速度随时间推移，不断增大
      this.playerVelocity.y += this.gravity * deltaTime;
    }
    // 计算玩家移动的距离
    const playerMoveDistance = this.playerVelocity.clone().multiplyScalar(deltaTime);
    this.playerCollider.translate(playerMoveDistance);
    // 设置胶囊位置 
    this.playerCollider.getCenter(this.capsule.position);

    this.playerCollisions();

    // 如果有水平移动，则设置相应动画
    const moveVelocity = Math.abs(this.playerVelocity.x) + Math.abs(this.playerVelocity.z);
    if (moveVelocity > 2.5) {
      this.toAction('Running');
    } else if (moveVelocity > 0.1) {
      this.toAction('Walking');
    } else {
      this.toAction('Idle');
    }
  }

  // 玩家碰撞检测
  playerCollisions() {
    const result = this.worldOctree.capsuleIntersect(this.playerCollider);
    // 默认不在地面上
    this.playerOnFloor = false;
    if (result) {
      this.playerOnFloor = result.normal.y > 0;
      // playerCollider，延法向方移动陷入深度(回到碰撞表面)
      this.playerCollider.translate(result.normal.multiplyScalar(result.depth));
    }
  }

  // 执行动画
  toAction(actionName) {
    if (!this.activeAction) {
      return;
    }
    let prevAction = this.activeAction;
    this.activeAction = this.actions[actionName];
    if (prevAction !== this.activeAction) {
      this.actionOutIn(prevAction, this.activeAction);
      // 动画完成，回到Idle动画
      this.mixer.addEventListener('finished', () => {
        let prevAction = this.activeAction;
        this.activeAction = this.actions['Idle'];
        this.actionOutIn(prevAction);
      });
    }
  }

  // 让上一个动画淡出，新的动画渐入
  actionOutIn(prevAction,) {
    prevAction.fadeOut(0.3); // 在传入的时间间隔内，逐渐将此动作的权重由1降至0
    this.activeAction
      .reset()
      .setEffectiveTimeScale(1) // 设置时间比例为1，以及停用所有的变形
      .setEffectiveWeight(1) // 设置权重为1，以及停止所有淡入淡出
      .fadeIn(0.3) // 在传入的时间间隔内，逐渐将此动作的权重由0升到1
      .play();
  }


  // 重置玩家信息
  resetPlayer() {
    if (this.capsule.position.y < -20) {
      this.playerCollider.start.set(0, 2 + 0.35, 0);
      this.playerCollider.end.set(0, 2 + 1.35, 0);
      this.playerCollider.radius = 0.35;
      this.playerVelocity.set(0, 0, 0);
      this.playerDirection.set(0, 0, 0);
    }
  }

  // 根据键盘状态更新玩家速度
  controlPlayer(time) {
    if (keyStates.w) {
      this.playerDirection.z = 1;
      const capsuleFront = new THREE.Vector3(0, 0, 0);
      // 获取胶囊正前面的方向
      // getWorldDirection是将表示该物体在世界空间中Z轴正方向的矢量，保存到capsuleFront
      this.capsule.getWorldDirection(capsuleFront);
      // 计算玩家速度
      // multiplyScalar将该向量与所传入的标量进行相乘
      // add将传入的向量和这个向量相加
      this.playerVelocity.add(capsuleFront.multiplyScalar(time));
    }
    if (keyStates.s) {
      this.playerDirection.z = 1;
      const capsuleFront = new THREE.Vector3(0, 0, 0);
      this.capsule.getWorldDirection(capsuleFront);
      this.playerVelocity.add(capsuleFront.multiplyScalar(-time));
    }
    if (keyStates.a) {
      this.playerDirection.z = 1;
      const capsuleFront = new THREE.Vector3(0, 0, 0);
      this.capsule.getWorldDirection(capsuleFront);
      // 计算侧方向
      // 正前方向和正上方向可以确定一个面，求叉积，得到侧方向
      // capsuleFront正前方向
      // capsule.up正上方向
      // cross将该向量设置为它本身与传入的向量v的叉积
      capsuleFront.cross(this.capsule.up);
      this.playerVelocity.add(capsuleFront.multiplyScalar(-time));
    }
    if (keyStates.d) {
      this.playerDirection.z = 1;
      const capsuleFront = new THREE.Vector3(0, 0, 0);
      this.capsule.getWorldDirection(capsuleFront);
      capsuleFront.cross(this.capsule.up);
      this.playerVelocity.add(capsuleFront.multiplyScalar(time));
    }
    if (keyStates[' ']) {
      this.playerVelocity.y = 15;
    }
  }


  // 监听键盘按下事件
  initKeyEvent() {
    const isDown = true;
    document.addEventListener('keydown', event => this.updateKeyState(event, isDown), false);
    document.addEventListener('keyup', event => this.updateKeyState(event, !isDown), false);
  }

  // 跟据键盘事件更新按键状态
  updateKeyState(event, isDown) {
    const { key } = event;
    keyStates[event.key] = isDown;
    keyStates.isDown = isDown;
    // 按键抬起事件
    !isDown && this.keyUpEvent(event);
  }

  keyUpEvent(event) {
    // 抬超v键时切换相机视角
    if (event.key === 'v') {
      this.activeCamera =
        this.activeCamera === this.camera ?
          this.backCamera : this.camera;
    }
    if (event.key === 't') {
      this.toAction('Wave');
    }
  }

  // 监听鼠标移动事件
  initMouseMoveEvent(close) {
    window.addEventListener('mousemove', event => {
      if (close) { return; }
      // 设置胶囊旋转
      // movementX鼠标在水平方向上的移动值
      this.capsule.rotation.y -= event.movementX * 0.003;
      // 通过控制空物体上下方向，改变相机上下方向
      this.emptyMesh.rotation.x += event.movementY * 0.003;
      // 限制上下方向最大小角度
      if (this.emptyMesh.rotation.x > Math.PI / 8) {
        this.emptyMesh.rotation.x = Math.PI / 8;
      }
      if (this.emptyMesh.rotation.x < -Math.PI / 8) {
        this.emptyMesh.rotation.x = -Math.PI / 8;
      }
    });
  }

  // 监听鼠标按下事件
  initMouseDownEvent() {
    window.addEventListener('mousedown', () => {
      if (this.controls) { return; }
      // 锁定鼠标指针
      document.body.requestPointerLock();
    }, false);
  }

  update(time) {
    this.controlPlayer(time);
    this.updatePlayer(time);
    this.resetPlayer();
    this.mixer && this.mixer.update(time);
    this.emitPositionEvent();
  }

  emitPositionEvent() {
    this.eventPositionList.forEach((item, i) => {
      // 计算胶囊距离某个点的距离，是否触发事件
      const distanceToSquared = this.capsule.position.distanceToSquared(item.position);
      if (distanceToSquared < item.radius * item.radius && item.isInner == false) {
        item.isInner = true;
        item.callback && item.callback(item);
      }

      if (distanceToSquared >= item.radius * item.radius && item.isInner == true) {
        item.isInner = false;
        item.outCallback && item.outCallback(item);
      }
    });
  }

  onPosition(position, callback, outCallback, radius = 2) {
    position = position.clone();
    this.eventPositionList.push({
      position,
      callback,
      outCallback,
      isInner: false,
      radius,
    });
  }
}
