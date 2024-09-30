<script setup lang="ts">
import { ref } from 'vue'
import { ElSelect, ElOption } from 'element-plus'
import { ConnectionType } from '@ioceditor/core'

import type { IocEditor } from '@ioceditor/core'

const props = defineProps<{
  iocEditor: IocEditor
}>()

const currentLineType = ref(ConnectionType.OrtogonalLine)

const toolsConfig = ref([
  {
    name: 'save',
    icon: 'icon-save',
    desc: '保存为文件',
    disabled: false
  },
  {
    name: 'openFile',
    icon: 'icon-folder-open',
    desc: '打开文件',
    disabled: false
  },
  {
    name: 'saveToPicture',
    icon: 'icon-image',
    desc: '保存为图片',
    disabled: true
  },
  {
    name: 'undo',
    icon: 'icon-undo',
    desc: '撤销',
    disabled: true
  },
  {
    name: 'redo',
    icon: 'icon-redo',
    desc: '重做',
    disabled: true
  },
  {
    name: 'zoomIn',
    icon: 'icon-zoomin',
    desc: '放大',
    disabled: false
  },
  {
    name: 'zoomOut',
    icon: 'icon-zoomout',
    desc: '缩小',
    disabled: false
  },
  {
    name: 'clear',
    icon: 'icon-clear',
    desc: '清除画布',
    disabled: false
  },
  {
    name: 'group',
    icon: 'icon-group',
    desc: '组合',
    disabled: false
  },
  {
    name: 'ungroup',
    icon: 'icon-ungroup',
    desc: '取消组合',
    disabled: false
  },
  {
    name: 'select',
    icon: 'icon-select',
    desc: '框选',
    disabled: false
  }
])

const lineOptions = [
  {
    value: ConnectionType.OrtogonalLine,
    label: '折线'
  },
  {
    value: ConnectionType.Line,
    label: '直线'
  },
  {
    value: ConnectionType.BezierCurve,
    label: '曲线'
  }
]

const changeLineType = (value: ConnectionType) => {
  currentLineType.value = value
  command('lineType')
}

const command = (name: string) => {
  switch (name) {
    case 'zoomIn':
      // 放大
      props.iocEditor._zoomMgr.zoomIn()
      break
    case 'zoomOut':
      // 缩小
      props.iocEditor._zoomMgr.zoomOut()
      break
    case 'lineType':
      props.iocEditor._connectionMgr.setConnectionType(currentLineType.value)
      break
    case 'clear':
      props.iocEditor._sceneMgr.clear()
      break
    case 'select':
      props.iocEditor._selectFrameMgr.setSelectFrameStatus(true)
      break
    case 'group':
      props.iocEditor._groupMgr.createGroup()
      break
    case 'ungroup':
      props.iocEditor._groupMgr.unGroup()
      break
    case 'save':
      props.iocEditor.exportFile()
      break
    case 'openFile':
      props.iocEditor.openFile()
      break
    default:
      break
  }
}
</script>

<template>
  <div class="header-tools">
    <span
      class="icon iconfont tool-icon"
      :class="{
        [tool.icon]: true,
        disabled: tool.disabled
      }"
      @click="command(tool.name)"
      v-for="tool in toolsConfig"
      :key="tool.name"
      :title="tool.desc"
    ></span>
    <el-select
      v-model="currentLineType"
      :size="'small'"
      @change="changeLineType"
      style="width: 60px"
    >
      <el-option
        v-for="item in lineOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<style scoped lang="less">
.header-tools {
  height: 40px;
  width: 100%;
  display: flex;
  align-items: center;
  background: #fbfbfb;
  border-bottom: 1px solid #dadce0;
  padding: 4px 14px;
  .tool-icon {
    margin-right: 10px;
    cursor: pointer;
    font-size: 18px;
    padding: 4px;
    margin-right: 8px;
    color: #000;
    &:hover {
      cursor: pointer;
      background-color: #eeeeee;
      color: #5cb6ff;
    }
    &.disabled {
      color: #ccc;
    }
  }
}
</style>
