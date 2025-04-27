<script setup lang="ts">
import { ElMessage } from 'element-plus'
import HeaderTools from './components/HeaderTools.vue'
import ElementPanel from './components/ElementPanel.vue'
import EditorPanel from './components/EditorPanel.vue'
import PropertyPanel from './components/PropertyPanel.vue'
import MiniMap from './components/MiniMap.vue'
import { onMounted, ref } from 'vue'
import { TinyFlowchart } from '@tiny-flowchart/core'

const editor = ref<TinyFlowchart>()

onMounted(() => {
  editor.value = new TinyFlowchart(document.getElementById('tiny-flowchart') as HTMLElement, {
    zoomStep: 0.2325,
    enableGrid: true
  })

  editor.value.updateMessage$.subscribe(({ info, type }) => {
    // @ts-ignore
    ElMessage[type](info)
  })
})
</script>

<template>
  <div class="tiny-flowchart-wrapper">
    <HeaderTools v-if="editor" :tiny-flowchart="editor" />
    <ElementPanel v-if="editor" :tiny-flowchart="editor" />
    <EditorPanel :tiny-flowchart="editor as TinyFlowchart" />
    <PropertyPanel v-if="editor" :tiny-flowchart="editor" />
    <MiniMap v-if="editor" :tiny-flowchart="editor" />
  </div>
</template>

<style scoped lang="less">
.tiny-flowchart-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
