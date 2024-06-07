<script setup lang="ts">
import { ref } from 'vue'

const title = ref('节点属性')
</script>

<template>
  <div class="property">
    <div class="property-title">{{ title }}</div>
  </div>
</template>

<style scoped lang="less">
.property {
  width: 260px;
  position: absolute;
  right: 0;
  top: 40px;
  height: calc(100% - 200px);
  border-bottom: 1px solid #dadce0;
  .property-title {
    display: block;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    font-size: 14px;
    border-bottom: 1px solid #e5e5e5;
    font-weight: bold;
  }
}
</style>
