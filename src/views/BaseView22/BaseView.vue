<!-- 127.智慧城市 -->
<!-- 下载模型 https://cadmapper.com/pro/home -->
<!-- window 打开模型 Autodesk 3ds Max -->
<!-- mac 打开模型 Rhino -->
<template>
  <Scene :eventList="eventList"></Scene>
  <Screen :dataInfo="dataInfo" :eventList="eventList"></Screen>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import * as THREE from 'three';
import { getSmartCityInfo, getSmartCityList } from '@/api/city';
import { gsap } from 'gsap';

import Scene from '@/components/Scene.vue';
import Screen from '@/components/Screen.vue';

const dataInfo = reactive({
  iot: { number: 0 },
  event: { number: 0 },
  power: { number: 0 },
  test: { number: 0 },
});

const eventList = ref([]);

onMounted(async () => {
  getNewInfo();
  getEventList();
  setInterval(() => {
    getNewInfo();
    getEventList();
  }, 10000);
});

const getNewInfo = async () => {
  const res = await getSmartCityInfo();
  const { data } = res.data;
  // dataInfo.iot = data.iot;
  // dataInfo.event = data.event;
  // dataInfo.power = data.power;
  // dataInfo.test = data.test;
  for (let key in data) {
    dataInfo[key].name = data[key].name;
    dataInfo[key].unit = data[key].unit;

    gsap.to(dataInfo[key], {
      number: data[key].number,
      duration: 1,
    });
  }
};

const getEventList = async () => {
  const res = await getSmartCityList();
  const { list } = res.data;
  list.forEach(item => {
    item.id = item.id || Math.random();
  });
  eventList.value = list;
}

</script>

<style lang="less" scope></style>
<style>
body {
  background-color: #1e1a20;
}
</style>