<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { TinyFlowchart, MiniMapManage } from '@tiny-flowchart/core'

import type { IMiniMapManage } from '@tiny-flowchart/core'

const miniMapIoc = ref<TinyFlowchart>()
const miniMapMgr = ref<IMiniMapManage>()

const { tinyFlowchart } = defineProps<{
  tinyFlowchart: TinyFlowchart
}>()

onMounted(() => {
  const miniMapContainer = document.getElementById('mini-map') as HTMLElement

  miniMapIoc.value = new TinyFlowchart(miniMapContainer, { enableMiniMap: true, enableGrid: false })
  miniMapIoc.value.offEvent()

  miniMapMgr.value = new MiniMapManage(miniMapIoc.value, tinyFlowchart)

  tinyFlowchart.updateMiniMap$.subscribe(() => {
    miniMapMgr.value?.refreshMap(tinyFlowchart.getExportData())
  })

  tinyFlowchart.updateMiniMapVisible$.subscribe(visible => {
    miniMapMgr.value?.setVisible(visible)
  })
})

const startX = ref(0)
const startY = ref(0)
const oldViewPortX = ref(0)
const oldViewPortY = ref(0)
const oldMiniMapFrameX = ref(0)
const oldMiniMapFrameY = ref(0)
const isDragging = ref(false)

const handleMouseDown = (e: MouseEvent) => {
  startX.value = e.offsetX
  startY.value = e.offsetY
  isDragging.value = true
  oldViewPortX.value = tinyFlowchart._viewPortMgr.getPosition()[0]
  oldViewPortY.value = tinyFlowchart._viewPortMgr.getPosition()[1]
  oldMiniMapFrameX.value = miniMapMgr.value?.getMiniMapFramePosition()[0] as number
  oldMiniMapFrameY.value = miniMapMgr.value?.getMiniMapFramePosition()[1] as number
}
let time = 0
const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  if (time && Date.now() - time < 20) return
  time = Date.now()

  const deltaX = e.offsetX - startX.value
  const deltaY = e.offsetY - startY.value
  const zoomScale = miniMapMgr.value?.getZoomScale() as number
  const scaleRatio = miniMapMgr.value?.getScaleRatio() as number
  const offsetX = -deltaX / scaleRatio / zoomScale
  const offsetY = -deltaY / scaleRatio / zoomScale

  miniMapMgr.value?.updateMiniMapFramePosition(
    oldMiniMapFrameX.value + deltaX,
    oldMiniMapFrameY.value + deltaY
  )
  tinyFlowchart._viewPortMgr.setPosition(oldViewPortX.value + offsetX, oldViewPortY.value + offsetY)
}

const handleMouseUp = (e: MouseEvent) => {
  isDragging.value = false
  e.preventDefault()
  miniMapMgr.value?.updateOldPosition()
}
</script>

<template>
  <div
    class="mini-map-container"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
  >
    <div id="mini-map"></div>
  </div>
</template>

<style scoped lang="less">
.mini-map-container {
  padding: 10px;
  border: 1px solid #ccc;
  width: 260px;
  height: 160px;
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: #fff;
  border-radius: 2px;
  #mini-map {
    width: 100%;
    height: 100%;
  }
}
</style>
