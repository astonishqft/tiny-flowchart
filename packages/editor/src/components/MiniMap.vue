<script setup lang="ts">
// import type { IocEditor } from '@ioceditor/core'

// const { iocEditor } = defineProps<{
//   iocEditor: IocEditor
// }>()
</script>

<template>
  <div class="mini-map">
    <div class="title">缩略图</div>
  </div>
</template>

<style scoped lang="less">
.mini-map {
  width: 260px;
  height: 160px;
  position: absolute;
  bottom: 0;
  right: 0;
  .title {
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