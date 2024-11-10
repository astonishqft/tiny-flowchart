<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { IocEditor } from '@ioceditor/core'

import type { IShape, INodeGroup } from '@ioceditor/core'

const miniMap = ref<IocEditor>()

const { iocEditor } = defineProps<{
  iocEditor: IocEditor
}>()

onMounted(() => {
  const miniMapContainer = document.getElementById('mini-map') as HTMLElement
  miniMap.value = new IocEditor(miniMapContainer, {
    zoomStep: 0.2325
  })

  miniMap.value.offEvent()

  iocEditor.updateAddNode$.subscribe((shape: IShape | INodeGroup) => {
    const data = iocEditor.getData()
    miniMap.value?.initFlowChart(data)
  })
})
</script>

<template>
  <div class="mini-map-container">
    <div class="title">缩略图</div>
    <div id="mini-map"></div>
  </div>
</template>

<style scoped lang="less">
.mini-map-container {
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
  #mini-map {
    width: 100%;
    height: 100%;
    position: relative;
    // background: pink;
  }
}
</style>
