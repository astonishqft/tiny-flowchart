<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { IocEditor, MiniMapManage } from '@ioceditor/core'

import type { IMiniMapManage } from '@ioceditor/core'

const miniMapIoc = ref<IocEditor>()
const miniMapMgr = ref<IMiniMapManage>()

const { iocEditor } = defineProps<{
  iocEditor: IocEditor
}>()

onMounted(() => {
  const miniMapContainer = document.getElementById('mini-map') as HTMLElement

  miniMapIoc.value = new IocEditor(miniMapContainer, { enableMiniMap: true })
  miniMapIoc.value.offEvent()
  miniMapIoc.value._sceneMgr.setCursorStyle('grab')

  miniMapMgr.value = new MiniMapManage(miniMapIoc.value, iocEditor)

  iocEditor.updateMiniMap$.subscribe(() => {
    miniMapMgr.value?.refreshMap(iocEditor.getData())
  })

  document.addEventListener('mouseup', handleMouseUp)
  document.addEventListener('mousedown', handleMouseDown)
})

onUnmounted(() => {
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('mousedown', handleMouseDown)
})

const startX = ref(0)
const startY = ref(0)
const isDragging = ref(false)
const oldViewPortX = ref(0)
const oldViewPortY = ref(0)
const oldMiniMapFrameX = ref(0)
const oldMiniMapFrameY = ref(0)
const handleMouseDown = (e: MouseEvent) => {
  startX.value = e.offsetX
  startY.value = e.offsetY
  isDragging.value = true
  oldViewPortX.value = iocEditor._viewPortMgr.getPosition()[0]
  oldViewPortY.value = iocEditor._viewPortMgr.getPosition()[1]
  oldMiniMapFrameX.value = miniMapMgr.value?.getMiniMapFramePosition()[0] as number
  oldMiniMapFrameY.value = miniMapMgr.value?.getMiniMapFramePosition()[1] as number
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
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
  iocEditor._viewPortMgr.setPosition(oldViewPortX.value + offsetX, oldViewPortY.value + offsetY)

  miniMapIoc.value?._sceneMgr.setCursorStyle('grabbing')
}

const handleMouseUp = (e: MouseEvent) => {
  e.preventDefault()
  isDragging.value = false
  miniMapMgr.value?.updateOldPosition()
  miniMapIoc.value?._sceneMgr.setCursorStyle('grab')
}
</script>

<template>
  <div class="mini-map-container" @mousemove="handleMouseMove">
    <!-- <div class="title">缩略图</div> -->
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
  #mini-map {
    width: 100%;
    height: 100%;
  }
}
</style>
