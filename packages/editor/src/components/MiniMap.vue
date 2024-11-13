<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { IocEditor } from '@ioceditor/core'

import type { INodeGroup, IShape } from '@ioceditor/core'

const miniMap = ref<IocEditor>()

const { iocEditor } = defineProps<{
  iocEditor: IocEditor
}>()

onMounted(() => {
  const miniMapContainer = document.getElementById('mini-map') as HTMLElement

  const containerWidth = miniMapContainer.offsetWidth
  const containerHeight = miniMapContainer.offsetHeight
  const containerRatio = containerWidth / containerHeight
  miniMap.value = new IocEditor(miniMapContainer)

  miniMap.value.offEvent()

  iocEditor.updateAddNode$.subscribe((shape: IShape | INodeGroup) => {
    const data = iocEditor.getData()
    miniMap.value?.initFlowChart(data)

    const { x, y, width, height } = miniMap
      .value!._viewPortMgr.getViewPort()
      .getBoundingRect([
        ...miniMap.value!._storageMgr.getNodes(),
        ...miniMap.value!._storageMgr.getConnections()
      ])

    const miniMapRatio = width / height

    let scaleRatio = 1
    if (miniMapRatio > containerRatio) {
      scaleRatio = containerWidth / width
    } else {
      scaleRatio = containerHeight / height
    }

    console.log('x', x)
    console.log('y', y)
    console.log('width', width)
    console.log('height', height)
    console.log('scaleRatio', scaleRatio)

    miniMap.value!._viewPortMgr.getViewPort().attr('x', -x * scaleRatio)
    miniMap.value!._viewPortMgr.getViewPort().attr('y', -y * scaleRatio)
    miniMap.value!._viewPortMgr.getViewPort().attr('scaleX', scaleRatio)
    miniMap.value!._viewPortMgr.getViewPort().attr('scaleY', scaleRatio)
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
