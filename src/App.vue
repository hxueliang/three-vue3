<script setup>
import { RouterView } from 'vue-router';
</script>

<template>
  <RouterView />
</template>

<style scoped></style>

<style lang="less">
#cssrender {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  pointer-events: none;
}

.factory.elementTag {
  position: relative;
  top: 15px;
  left: -25px;

  .elementContent {
    background: rgba(20, 143, 221, 0.68);
    box-shadow: 0 0 12px rgba(0, 128, 255, 0.75);
    border: 1px solid rgba(127, 177, 255, 0.75);
    padding: 20px;
    color: #efefef;

    h3 {
      font-size: 20px;
      font-weight: bold;
    }
  }

  ::before {
    content: '';
    display: block;
    position: absolute;
    width: 100px;
    height: 1px;
    background: rgba(127, 177, 255, 0.75);
    bottom: 0;
    right: -100px;
    transform: rotate(30deg);
    transform-origin: 0 0;
  }

  ::after {
    content: '';
    display: block;
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: rgba(127, 177, 255, 0.75);
    bottom: -65px;
    right: -105px;
  }
}
</style>