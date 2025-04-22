<script setup lang="ts">
import { TinyFlowchart } from '@tiny-flowchart/core'

const props = defineProps<{
  tinyFlowchart: TinyFlowchart
}>()
const drop = (event: DragEvent) => {
  // 阻止默认行为（会作为某些元素的链接打开）
  event.preventDefault()

  const { offsetX, offsetY } = event
  const data = event.dataTransfer!.getData('addShape')

  const { nodeType, url } = JSON.parse(data)

  if (props.tinyFlowchart) {
    props.tinyFlowchart.addShape({ shapeType: nodeType, x: offsetX, y: offsetY, url })
  }
}

const dragOver = (event: DragEvent) => {
  // 在Vue 3中，可以使用@dragover.prevent或v-on:dragover.prevent指令来阻止浏览器的默认行为。如果没有阻止此事件的默认行为，浏览器将不会触发drop事件。
  event.preventDefault()
}
</script>

<template>
  <div class="tiny-flowchart-container" @drop="drop" @dragover="dragOver">
    <div id="tiny-flowchart"></div>
  </div>
</template>

<style scoped lang="less">
.tiny-flowchart-container {
  height: calc(100% - 40px);
  position: absolute;
  width: calc(100% - 185px);
  left: 185px;
  border-right: 1px solid #dadce0;
  #tiny-flowchart {
    width: 100%;
    height: 100%;
    position: absolute;
  }
}
</style>
