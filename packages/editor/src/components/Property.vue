<script setup lang="ts">
import { ref, inject } from 'vue'
import { Container } from 'inversify'
import SceneProperty from './elementProperty/SceneProperty.vue'
import NodeProperty from './elementProperty/NodeProperty.vue'
import ConnectionProperty from './elementProperty/ConnectionProperty.vue'
import { IDENTIFIER } from '@ioceditor/core'

import type { ISceneManage, IShapeManage, IConnectionManage, IShape, IConnection } from '@ioceditor/core'
const type = ref('scene')
const activeShape = ref<IShape>()
const activeConnection = ref<IConnection>()

const iocEditor = inject<Container>('iocEditor') as Container

const sceneMgr = iocEditor.get<ISceneManage>(IDENTIFIER.SCENE_MANAGE)
const shapeMgr = iocEditor.get<IShapeManage>(IDENTIFIER.SHAPE_MANAGE)
const connectionMgr = iocEditor.get<IConnectionManage>(IDENTIFIER.CONNECTION_MANAGE)

sceneMgr.updateSelectScene$.subscribe(() => {
  console.log('选中画布')
  type.value = 'scene'
})

shapeMgr.updateSelectShape$.subscribe((shape: IShape) => {
  console.log('选中节点')
  type.value = 'shape'
  activeShape.value = shape
})

connectionMgr.updateSelectConnection$.subscribe((connection: IConnection) => {
  console.log('选中连线')
  type.value = 'connection'
  activeConnection.value = connection
})

const selectNameMap: Record<string, string> = {
  scene: '画布属性',
  shape: '节点属性',
  connection: '连线属性'
}

</script>

<template>
  <div class="property">
    <div class="property-title">{{ selectNameMap[type] }}</div>
    <div class="property-content">
      <SceneProperty v-show="type === 'scene'" />
      <NodeProperty v-show="type === 'shape'" />
      <ConnectionProperty v-show="type === 'connection'" />
    </div>
  </div>
</template>

<style scoped lang="less">
.property {
  width: 260px;
  position: absolute;
  right: 0;
  top: 40px;
  height: calc(100% - 200px);
  border-bottom: 1px solid #dadce0;
  .property-title {
    display: block;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    font-size: 14px;
    border-bottom: 1px solid #e5e5e5;
    font-weight: bold;
  }
}
</style>
