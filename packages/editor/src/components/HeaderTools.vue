<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  ElOption,
  ElSelect,
  ElDropdown,
  ElIcon,
  ElDropdownMenu,
  ElDropdownItem,
  ElCheckbox
} from 'element-plus'
import { ConnectionType } from '@ioceditor/core'
import { ArrowDown, QuestionFilled } from '@element-plus/icons-vue'

import type { CheckboxValueType } from 'element-plus'
import type { IIocEditor } from '@ioceditor/core'

const props = defineProps<{
  iocEditor: IIocEditor
}>()

const currentLineType = ref(ConnectionType.OrtogonalLine)

const toolsConfig = reactive([
  {
    name: 'save',
    icon: 'icon-save',
    desc: '保存',
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
    disabled: false
  },
  {
    name: 'saveToFile',
    icon: 'icon-LineDown',
    desc: '保存为文件',
    disabled: false
  },
  {
    name: 'divider',
    icon: 'icon-chuizhifengexian'
  },
  {
    name: 'undo',
    icon: 'icon-undo',
    desc: '撤销',
    disabled: false
  },
  {
    name: 'redo',
    icon: 'icon-redo',
    desc: '重做',
    disabled: false
  },
  {
    name: 'divider',
    icon: 'icon-chuizhifengexian'
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
    name: 'divider',
    icon: 'icon-chuizhifengexian'
  },
  {
    name: 'delete',
    icon: 'icon-delete',
    desc: '删除',
    disabled: false
  },
  {
    name: 'clear',
    icon: 'icon-clear',
    desc: '清除画布',
    disabled: false
  },
  {
    name: 'divider',
    icon: 'icon-chuizhifengexian'
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
    name: 'divider',
    icon: 'icon-chuizhifengexian'
  },
  {
    name: 'select',
    icon: 'icon-select',
    desc: '框选',
    disabled: false
  },
  {
    name: 'divider',
    icon: 'icon-chuizhifengexian'
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
      props.iocEditor.clear()
      break
    case 'select':
      props.iocEditor._selectFrameMgr.setSelectFrameStatus(true)
      break
    case 'group':
      props.iocEditor.createGroup()
      break
    case 'ungroup':
      props.iocEditor.unGroup()
      break
    case 'save':
      props.iocEditor.save()
      break
    case 'saveToFile':
      props.iocEditor.exportFile()
      break
    case 'saveToPicture':
      props.iocEditor.exportPicture()
      break
    case 'openFile':
      props.iocEditor.openFile()
      break
    case 'undo':
      props.iocEditor.undo()
      break
    case 'redo':
      props.iocEditor.redo()
      break
    case 'delete':
      props.iocEditor.delete()
      break
    default:
      break
  }
}

const aboutMe = (e: MouseEvent) => {
  e.preventDefault()
}

const isShowGrid = ref<boolean>(true)
const isShowMiniMap = ref<boolean>(true)

const showGrid = (show: CheckboxValueType) => {
  isShowGrid.value = show as boolean
  props.iocEditor._viewPortMgr._gridMgr?.showGrid(isShowGrid.value)
}

const showMiniMap = (show: CheckboxValueType) => {
  isShowMiniMap.value = show as boolean
  props.iocEditor.updateMiniMapVisible$.next(show as boolean)
}
</script>

<template>
  <div class="header-tools">
    <div class="logo-group">
      <img src="../assets/logo.png" alt="logo" class="logo" />
    </div>
    <div class="tools-btn-group">
      <span
        class="icon iconfont tool-icon"
        :class="{
          [tool.icon]: true,
          disabled: tool.disabled,
          divier: tool.name === 'divider'
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
      <el-checkbox
        v-model="isShowGrid"
        label="显示网格线"
        size="small"
        @change="showGrid"
        style="margin-left: 15px"
      />
      <el-checkbox v-model="isShowMiniMap" label="显示小地图" size="small" @change="showMiniMap" />
    </div>
    <div class="tools-about">
      <a href="https://github.com/astonishqft/ioc-editor" title="GitHub" target="_blank">
        <span class="icon iconfont tool-icon icon-github"></span>
      </a>
      <el-dropdown>
        <span class="el-dropdown-link">
          <el-icon :size="20">
            <question-filled />
          </el-icon>
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <a href="" @click="aboutMe">关于我</a>
            </el-dropdown-item>
            <el-dropdown-item>
              <a
                href="https://github.com/astonishqft/ioc-editor/issues/new"
                title="GitHub"
                target="_blank"
                >意见反馈</a
              >
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped lang="less">
.header-tools {
  height: 40px;
  width: 100%;
  display: flex;
  align-items: center;
  background: #ffff;
  border-bottom: 1px solid #dadce0;
  padding: 4px 14px;
  box-shadow: 0 0 2px 2px rgba(0, 0, 0, 0.1);
  justify-content: space-between;
  align-items: center;
  .tools-btn-group {
    height: 100%;
    margin: 0 auto;
    display: flex;
    align-items: center;
  }
  .logo-group {
    height: 100%;
    display: flex;
    align-items: center;
    .logo {
      width: 68px;
      border-radius: 4px;
    }
  }

  .tools-about {
    height: 100%;
    display: flex;
    align-items: center;
    .el-dropdown-link {
      display: flex;
      align-items: center;
      cursor: pointer;
      color: var(--el-color-primary);
      display: flex;
    }
    a {
      text-decoration: none;
    }
  }
  .tool-icon {
    margin-right: 10px;
    cursor: pointer;
    font-size: 18px;
    padding: 2px;
    margin-right: 8px;
    color: #1f1f1f;
    &:hover {
      cursor: pointer;
      background-color: #eeeeee;
      color: #5cb6ff;
    }
    &.disabled {
      color: #ccc;
    }
    &.divier {
      color: #ccc;
      padding: 0;
    }
  }
}
</style>
