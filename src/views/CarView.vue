

<template>
  <TheCar ref="carDom" />

  <div class="home-content">
    <div class="home-content-title">
      <h1>汽车展示与选配</h1>
    </div>
    <h2>选择车身颜色</h2>
    <div class="select">
      <div class="select-item" v-for="(item, index) in colors" :key="index" @click="selectColor(index)">
        <div class="select-item-color" :style="{ backgroundColor: item }"></div>
      </div>
    </div>

    <h2>选择贴膜材质</h2>
    <div class="select">
      <div class="select-item" v-for="(item, index) in materials" :key="index" @click="selectMaterial(index)">
        <div class="select-item-text">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TheCar from "../components/TheCar.vue";
import { ref, onMounted } from 'vue';

const colors = ["red", "blue", "green", "gray", "orange", "purple"];
let materials = [
  { name: "磨砂", value: 1 },
  { name: "冰晶", value: 0 },
];

const carDom = ref();

let selectColor = (index) => {
  carDom.value.selectColor(index, colors);
};
function selectMaterial(index) {
  carDom.value.selectMaterial(index, materials);
}

onMounted(() => {
  console.log(carDom.value);
})


</script>

<style>
.home-content {
  position: fixed;
  top: 0;
  right: 20px;
}

.select-item-color,
.select-item-text {
  width: 50px;
  height: 50px;
  border: 1px solid #ccc;
  margin: 10px;
  display: inline-block;
  cursor: pointer;
  border-radius: 10px;
}

.select-item-text {
  background: #fff;
  text-align: center;
  line-height: 50px;
}

.select {
  display: flex;
}
</style>