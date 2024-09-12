<script setup lang="ts">
import HeaderTools from './components/HeaderTools.vue'
import ElementPanel from './components/ElementPanel.vue'
import Editor from './components/Editor.vue'
import Property from './components/Property.vue'
import MiniMap from './components/MiniMap.vue'
</script>

<template>
  <div class="ioc-editor">
    <HeaderTools />
    <ElementPanel />
    <Editor />
    <Property />
    <MiniMap />
  </div>
</template>

<style scoped lang="less">
.ioc-editor {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
