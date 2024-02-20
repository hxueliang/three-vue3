<template>
  <div id="screen">
    <div class="header">大浪智慧城市管理系统平台</div>
    <div class="main">
      <div class="left">
        <div class="cityEvent list">
          <h3>
            <span>热气球控制</span>
          </h3>
          <h1 @click='toggleAction(0)'>
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>直线运动</span>
          </h1>
          <h1 @click='toggleAction(1)'>
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>环绕运动</span>
          </h1>
          <div class="footerBorder"></div>
        </div>
        <div class="cityEvent list">
          <h3>
            <span>相机控制</span>
          </h3>
          <h1 @click="toggleCamera('小汽车摄像机')">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>小汽车相机</span>
          </h1>
          <h1 @click="toggleCamera('Camera')">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>全境相机</span>
          </h1>
          <h1 @click="toggleCamera('default')">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>默认相机</span>
          </h1>
          <div class="footerBorder"></div>
        </div>
      </div>
      <div class="right">
        <div class="cityEvent list">
          <h3>
            <span>切换观览模式</span>
          </h3>
          <h1 @click="toggleControls('Orbit')">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>轨道模式</span>
          </h1>
          <h1 @click="toggleControls('Trackball')">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>轨迹球模式</span>
          </h1>
          <h1 @click="toggleControls('Fly')">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>飞行模式</span>
          </h1>
          <h1 @click="toggleControls('FirstPerson')">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>第一人称模式</span>
          </h1>
        </div>
        <div class="cityEvent list">
          <h3>
            <span>改变相机视角到指定位置</span>
          </h3>
          <h1 @click="toggleCameraPosition('美女')">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>美女位置</span>
          </h1>
          <h1 @click="toggleCameraPosition('男人')">
            <img src="../../../assets/bg/bar.svg" class="icon">
            <span>男人位置</span>
          </h1>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import eventHub from '@/utils/event-hub';
import { ref, watch } from 'vue';

const props = defineProps(['dataInfo', 'eventList']);
const imgs = {
  电力: require('@/assets/bg/dianli.svg'),
  火警: require('@/assets/bg/fire.svg'),
  治安: require('@/assets/bg/jingcha.svg'),
};

const toFixInt = number => number.toFixed(0);

const toggleAction = i => {
  eventHub.emit('actionClick', i);
};

const toggleCamera = name => {
  eventHub.emit('toggleCamera', name);
};

const toggleControls = name => {
  eventHub.emit('toggleControls', name);
};

const toggleCameraPosition = name => {
  eventHub.emit('toggleCameraPosition', name);
}

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