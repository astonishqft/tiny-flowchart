<script setup lang="ts">
import { ref, inject } from 'vue'
import { ElSelect, ElOption } from 'element-plus'
import { Container } from 'inversify'
import { IDENTIFIER, ConnectionType } from '@ioceditor/core'
import type { IZoomManage, IConnectionManage, ISceneManage } from '@ioceditor/core'
import 'element-plus/es/components/select/style/css'

const iocEditor = inject<Container>('iocEditor') as Container
const zoomMgr = iocEditor.get<IZoomManage>(IDENTIFIER.ZOOM_MANAGE)
const connectionMgr = iocEditor.get<IConnectionManage>(IDENTIFIER.CONNECTION_MANAGE)
const sceneManage = iocEditor.get<ISceneManage>(IDENTIFIER.SCENE_MANAGE)

const currentLineType = ref(ConnectionType.OrtogonalLine)

const toolsConfig = ref([
  {
    name: 'save',
    icon: 'icon-save',
    desc: '保存为文件',
    disabled: true
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
    disabled: true
  },
  {
    name: 'ungroup',
    icon: 'icon-ungroup',
    desc: '取消组合',
    disabled: true
  },
  {
    name: 'select',
    icon: 'icon-select',
    desc: '框选',
    disabled: true
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
  switch(name) {
    case 'zoomIn':
      // 放大
      zoomMgr.zoomIn()
      break
    case 'zoomOut':
      // 缩小
      zoomMgr.zoomOut()
      break
    case 'lineType':
      connectionMgr.setConnectionType(currentLineType.value)
      break
    case 'clear':
      sceneManage.clear()
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
