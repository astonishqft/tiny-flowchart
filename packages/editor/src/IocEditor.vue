<script setup lang="ts">
import HeaderTools from './components/HeaderTools.vue'
import ElementPanel from './components/ElementPanel.vue'
import EditorPanel from './components/EditorPanel.vue'
import PropertyPanel from './components/PropertyPanel.vue'
import MiniMap from './components/MiniMap.vue'
import { ref, onMounted } from 'vue'
import { IocEditor } from '@ioceditor/core'

const editor = ref<IocEditor>()

onMounted(() => {
  editor.value = new IocEditor(document.getElementById('ioc-editor') as HTMLElement, {
    zoomStep: 0.2325
  })
})
</script>

<template>
  <div class="ioc-editor-wrapper">
    <HeaderTools v-if="editor" :ioc-editor="editor" />
    <ElementPanel v-if="editor" :ioc-editor="editor" />
    <EditorPanel :ioc-editor="editor" />
    <PropertyPanel v-if="editor" :ioc-editor="editor" />
    <MiniMap v-if="editor" :ioc-editor="editor" />
  </div>
</template>

<style scoped lang="less">
.ioc-editor-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
