<script setup lang="ts">
import { ref } from 'vue'
import SceneProperty from './elementProperty/SceneProperty.vue'
import NodeProperty from './elementProperty/NodeProperty.vue'
import ConnectionProperty from './elementProperty/ConnectionProperty.vue'
import GroupProperty from './elementProperty/GroupProperty.vue'

import type { IocEditor, IShape, IConnection, INodeGroup } from '@ioceditor/core'

const props = defineProps<{
  iocEditor: IocEditor
}>()

const type = ref('scene')
const activeShape = ref<IShape>()
const activeConnection = ref<IConnection>()
const activeGroup = ref<INodeGroup>()

if (props.iocEditor) {
  props.iocEditor._sceneMgr.updateSelectScene$.subscribe(() => {
    console.log('选中画布')
    type.value = 'scene'
  })

  props.iocEditor._shapeMgr.updateSelectShape$.subscribe((shape: IShape) => {
    console.log('选中节点')
    type.value = 'shape'
    activeShape.value = shape
  })

  props.iocEditor._connectionMgr.updateSelectConnection$.subscribe((connection: IConnection) => {
    console.log('选中连线')
    type.value = 'connection'
    activeConnection.value = connection
  })

  props.iocEditor._groupMgr.updateSelectGroup$.subscribe((group: INodeGroup) => {
    console.log('选中分组')
    type.value = 'group'
    activeGroup.value = group
  })
}

const selectNameMap: Record<string, string> = {
  scene: '画布属性',
  shape: '节点属性',
  connection: '连线属性',
  group: '群组属性'
}
</script>

<template>
  <div class="property">
    <div class="property-title">{{ selectNameMap[type] }}</div>
    <div class="property-content">
      <SceneProperty v-show="type === 'scene'" :ioc-editor="iocEditor" />
      <NodeProperty v-show="type === 'shape'" :ioc-editor="iocEditor" />
      <ConnectionProperty v-show="type === 'connection'" :ioc-editor="iocEditor" />
      <GroupProperty v-show="type === 'group'" :ioc-editor="iocEditor" />
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
