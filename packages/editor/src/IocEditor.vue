<script setup lang="ts">
import HeaderTools from './components/HeaderTools.vue'
import ElementPanel from './components/ElementPanel.vue'
import Editor from './components/Editor.vue'
import Property from './components/Property.vue'
import MiniMap from './components/MiniMap.vue'
import { ref, onMounted } from 'vue'
import { IocEditor } from '@ioceditor/core'

const editor = ref<IocEditor>()

onMounted(() => {
  editor.value = new IocEditor(document.getElementById('ioc-editor') as HTMLElement, {
    zoomStep: 0.2325,
  })
})
</script>

<template>
  <div class="ioc-editor">
    <HeaderTools v-if="editor" :ioc-editor="editor" />
    <ElementPanel v-if="editor" :ioc-editor="editor" />
    <Editor :ioc-editor="editor" />
    <Property v-if="editor" :ioc-editor="editor" />
    <MiniMap v-if="editor" :ioc-editor="editor" />
  </div>
</template>

<style scoped lang="less">
.ioc-editor {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
