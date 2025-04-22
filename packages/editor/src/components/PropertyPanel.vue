<script setup lang="ts">
import { ref } from 'vue'
import { NodeType, TinyFlowchart } from '@tiny-flowchart/core'
import ShapeProperty from './elementProperty/ShapeProperty.vue'
import ConnectionProperty from './elementProperty/ConnectionProperty.vue'
import GroupProperty from './elementProperty/GroupProperty.vue'

import type { IConnection, INodeGroup, IShape, INodeMouseDown } from '@tiny-flowchart/core'

const props = defineProps<{
  tinyFlowchart: TinyFlowchart
}>()

const type = ref('scene')
const activeShape = ref<IShape>()
const activeConnection = ref<IConnection>()
const activeGroup = ref<INodeGroup>()

if (props.tinyFlowchart) {
  props.tinyFlowchart._nodeEventMgr.updateNodeClick$.subscribe(({ node }: INodeMouseDown) => {
    console.log('选中节点', node)
    if (node?.nodeType === NodeType.Shape) {
      type.value = 'shape'
      activeShape.value = node as IShape
    } else if (node?.nodeType === NodeType.Group) {
      type.value = 'group'
      activeGroup.value = node as INodeGroup
    } else if (node === null) {
      type.value = 'scene'
    }
  })

  props.tinyFlowchart._connectionMgr.updateSelectConnection$.subscribe(
    (connection: IConnection) => {
      console.log('选中连线')
      type.value = 'connection'
      activeConnection.value = connection
    }
  )
}

const selectNameMap: Record<string, string> = {
  scene: '画布属性',
  shape: '节点属性',
  connection: '连线属性',
  group: '群组属性'
}
</script>

<template>
  <div class="property" v-show="type !== 'scene'">
    <div class="property-title">{{ selectNameMap[type] }}</div>
    <div class="property-content">
      <ShapeProperty v-show="type === 'shape'" :tiny-flowchart="tinyFlowchart" />
      <ConnectionProperty v-show="type === 'connection'" :tiny-flowchart="tinyFlowchart" />
      <GroupProperty v-show="type === 'group'" :tiny-flowchart="tinyFlowchart" />
    </div>
  </div>
</template>

<style scoped lang="less">
.property {
  width: 260px;
  position: fixed;
  right: 0;
  top: 40px;
  background: #fff;
  border: 1px solid var(--el-border-color);
  margin: 10px;
  border-radius: 5px;
  box-shadow: var(--el-box-shadow);
  .property-title {
    display: block;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    font-size: 14px;
    border-bottom: 1px solid var(--el-border-color);
    font-weight: bold;
  }
}
</style>
