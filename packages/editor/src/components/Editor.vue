<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { IocEditor } from '@ioceditor/core'

const editor = ref<IocEditor>()

onMounted(() => {
  editor.value = new IocEditor(document.getElementById('ioc-editor') as HTMLElement, {
    zoomStep: 0.2325,
  })
})

const drop = (event: DragEvent) => {
  // 阻止默认行为（会作为某些元素的链接打开）
  event.preventDefault()

  const { offsetX, offsetY } = event
  const data = event.dataTransfer!.getData('addShape')

  const { nodeType } = JSON.parse(data)

  if (editor.value) {
    editor.value.addShape(nodeType, {x: offsetX, y: offsetY})
  }
}

const dragOver = (event: DragEvent) => {
  // 在Vue 3中，可以使用@dragover.prevent或v-on:dragover.prevent指令来阻止浏览器的默认行为。如果没有阻止此事件的默认行为，浏览器将不会触发drop事件。
  event.preventDefault()
}
</script>

<template>
  <div class="ioc-editor-container" @drop="drop" @dragover="dragOver">
    <div id="ioc-editor-grid"></div>
    <div id="ioc-editor"></div>

  </div>
</template>

<style scoped lang="less">
.ioc-editor-container {
  height: calc(100% - 40px);
  position: absolute;
  width: calc(100% - 445px);
  left: 185px;
  border-right: 1px solid #dadce0;
  #ioc-editor {
    background-color: rgba(255, 255, 255, 0);
  }
  #ioc-editor,#ioc-editor-grid {
    width: 100%;
    height: 100%;
    position: absolute;
  }
}
</style>
