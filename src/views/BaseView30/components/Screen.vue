<template>
  <div id="screen">
    <div class="header">大浪智慧工厂管理系统平台</div>
    <div class="main">
      <div class="left">
        <div class="cityEvent list">
          <h3 @click="showMesh('showWall')">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>厂房外形展示</span>
          </h3>
          <div class="footerBorder"></div>
        </div>
        <div class="cityEvent list">
          <h3 @click="showMesh('showAll')">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>厂房分层展开</span>
          </h3>
          <div class="footerBorder"></div>
        </div>
        <div class="cityEvent list">
          <h3 @click="showMesh('showFloor1')">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>展示第一层楼</span>
          </h3>
          <div class="footerBorder"></div>
        </div>
        <div class="cityEvent list">
          <h3 @click="showMesh('showFloor2')">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>展示第二层楼</span>
          </h3>
          <div class="footerBorder"></div>
        </div>
      </div>
      <div class="right">
        <div class="cityEvent list">
          <h3>
            <span>飞机零件展示</span>
          </h3>
          <h1 @click="flatFighter('plane')">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>平面展示</span>
          </h1>
          <h1 @click="flatFighter('line')">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>直线展示</span>
          </h1>
          <h1 @click="recoverFighter">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>恢复模型</span>
          </h1>
          <div class="footerBorder"></div>
        </div>
        <div class="cityEvent list">
          <h3>
            <span>飞机粒子展示</span>
          </h3>
          <h1 @click="pointsFighter">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>粒子特效</span>
          </h1>
          <h1 @click="pointsBlast">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>粒子爆炸</span>
          </h1>
          <h1 @click="pointsRecover">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>粒子复原</span>
          </h1>
          <div class="footerBorder"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import eventHub from '@/utils/event-hub';
import { ref, watch } from 'vue';

const showMesh = meshType => {
  eventHub.emit(meshType);
};

const flatFighter = (type) => {
  eventHub.emit('flatFighter', type);
};

const recoverFighter = () => {
  eventHub.emit('recoverFighter');
};

const pointsFighter = () => {
  eventHub.emit('pointsFighter');
};

const pointsBlast = () => {
  eventHub.emit('pointsBlast');
};

const pointsRecover = () => {
  eventHub.emit('pointsRecover');
};

</script>

<style scoped>
#screen {
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 100;

  left: 0;
  top: 0;
  pointer-events: none;
  display: flex;
  flex-direction: column;
}

.header {
  /* width: 1920px;
        height: 100px; */

  width: 19.2rem;
  height: 1rem;
  background-image: url(@/assets/bg/title.png);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  text-align: center;
  color: rgb(226, 226, 255);
  font-size: 0.4rem;
}

.main {
  flex: 1;
  width: 19.2rem;
  display: flex;
  justify-content: space-between;
}

.left {
  width: 4rem;
  /* background-color: rgb(255,255,255,0.5); */
  background-image: url(@/assets/bg/line_img.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: right center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.4rem 0;
}

.right {
  width: 4rem;
  /* background-color: rgb(255,255,255,0.5); */
  background-image: url(@/assets/bg/line_img.png);
  background-repeat: no-repeat;
  background-size: contain;
  background-position: left center;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.4rem 0;
}

.cityEvent {
  position: relative;
  width: 3.5rem;
  /* height: 3rem; */
  margin-bottom: 0.5rem;
  background-image: url(@/assets/bg/bg_img03.png);
  background-repeat: repeat;
}

.cityEvent::before {
  width: 0.4rem;
  height: 0.4rem;
  position: absolute;
  left: 0;
  top: 0;
  border-top: 4px solid rgb(34, 133, 247);
  border-left: 4px solid rgb(34, 133, 247);
  content: "";
  display: block;
}

.cityEvent::after {
  width: 0.4rem;
  height: 0.4rem;
  position: absolute;
  right: 0;
  top: 0;
  border-top: 4px solid rgb(34, 133, 247);
  border-right: 4px solid rgb(34, 133, 247);
  content: "";
  display: block;
}

.footerBorder {
  position: absolute;
  bottom: 0;
  bottom: 0;
  width: 3.5rem;
  height: 0.4rem;
}

.footerBorder::before {
  width: 0.4rem;
  height: 0.4rem;
  position: absolute;
  left: 0;
  top: 0;
  border-bottom: 4px solid rgb(34, 133, 247);
  border-left: 4px solid rgb(34, 133, 247);
  content: "";
  display: block;
}

.footerBorder::after {
  width: 0.4rem;
  height: 0.4rem;
  position: absolute;
  right: 0;
  top: 0;
  border-bottom: 4px solid rgb(34, 133, 247);
  border-right: 4px solid rgb(34, 133, 247);
  content: "";
  display: block;
}

.icon {
  width: 40px;
  height: 40px;
}

h1 {
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 0.3rem 0.3rem;
  justify-content: space-between;
  font-size: 0.3rem;
}

h3 {
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0.3rem 0.3rem;
  /* 防止高光背景导致看不见白色文字 */
  text-shadow: 0 0 5px #000;
}

h1>div {
  display: flex;
  align-items: center;
}

h1 span.time {
  font-size: 0.2rem;
  font-weight: normal;
}

.cityEvent li>p {
  color: #eee;
  padding: 0rem 0.3rem 0.3rem;
}

.list h1 {
  padding: 0.1rem 0.3rem;
}

.cityEvent.list {
  pointer-events: auto;
  cursor: pointer;
}

.cityEvent li.active h1 {
  color: red;
}

.cityEvent li.active p {
  color: red;
}

ul,
li {
  list-style: none;
}
</style>