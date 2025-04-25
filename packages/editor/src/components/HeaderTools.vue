<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  ElOption,
  ElSelect,
  ElDropdown,
  ElIcon,
  ElDropdownMenu,
  ElDropdownItem,
  ElCheckbox,
  ElDialog
} from 'element-plus'
import { ConnectionType } from '@tiny-flowchart/core'
import { ArrowDown, QuestionFilled } from '@element-plus/icons-vue'

import type { CheckboxValueType } from 'element-plus'
import type { ITinyFlowchart } from '@tiny-flowchart/core'

const dialogVisible = ref(false)
const version = ref(__TINY_FLOWCHART_VERSION__)

const props = defineProps<{
  tinyFlowchart: ITinyFlowchart
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
    name: 'divider',
    icon: 'icon-chuizhifengexian'
  },
  {
    name: 'openFile',
    icon: 'icon-folder-open',
    desc: '打开文件',
    disabled: false
  },
  {
    name: 'divider',
    icon: 'icon-chuizhifengexian'
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
    name: 'top',
    icon: 'icon-zhiyudingceng',
    desc: '置于顶层',
    disabled: false
  },
  {
    name: 'bottom',
    icon: 'icon-zhiyudiceng',
    desc: '置于底层',
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
      props.tinyFlowchart._zoomMgr.zoomIn()
      break
    case 'zoomOut':
      // 缩小
      props.tinyFlowchart._zoomMgr.zoomOut()
      break
    case 'lineType':
      props.tinyFlowchart._connectionMgr.setConnectionType(currentLineType.value)
      break
    case 'clear':
      props.tinyFlowchart.clear()
      props.tinyFlowchart.updateMessage$.next({ info: '画布清除成功', type: 'success' })
      break
    case 'select':
      props.tinyFlowchart._selectFrameMgr.setSelectFrameStatus(true)
      break
    case 'group':
      props.tinyFlowchart.createGroup()
      break
    case 'ungroup':
      props.tinyFlowchart.unGroup()
      break
    case 'top':
      props.tinyFlowchart.setTop()
      break
    case 'bottom':
      props.tinyFlowchart.setBottom()
      break
    case 'save':
      props.tinyFlowchart.save()
      break
    case 'saveToFile':
      props.tinyFlowchart.exportFile()
      props.tinyFlowchart.updateMessage$.next({ info: '文件保存成功', type: 'success' })
      break
    case 'saveToPicture':
      props.tinyFlowchart.exportPicture()
      props.tinyFlowchart.updateMessage$.next({ info: '图片保存成功', type: 'success' })
      break
    case 'openFile':
      props.tinyFlowchart.openFile()
      break
    case 'undo':
      props.tinyFlowchart.undo()
      break
    case 'redo':
      props.tinyFlowchart.redo()
      break
    case 'delete':
      props.tinyFlowchart.delete()
      props.tinyFlowchart.updateMessage$.next({ info: '节点删除成功', type: 'success' })
      break
    default:
      break
  }
}

const about = (e: MouseEvent) => {
  e.preventDefault()
  dialogVisible.value = true
}

const isShowGrid = ref<boolean>(true)
const isShowMiniMap = ref<boolean>(true)

const showGrid = (show: CheckboxValueType) => {
  isShowGrid.value = show as boolean
  props.tinyFlowchart._viewPortMgr._gridMgr?.showGrid(isShowGrid.value)
}

const showMiniMap = (show: CheckboxValueType) => {
  isShowMiniMap.value = show as boolean
  props.tinyFlowchart.updateMiniMapVisible$.next(show as boolean)
}
</script>

<template>
  <div class="header-tools">
    <div class="logo-group">
      <img src="../assets/logo.jpg" alt="logo" class="logo" />
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
        size="small"
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
      <a href="https://github.com/astonishqft/tiny-flowchart" title="GitHub" target="_blank">
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
              <a href="" @click="about">关于tiny-flowchart</a>
            </el-dropdown-item>
            <el-dropdown-item>
              <a
                href="https://github.com/astonishqft/tiny-flowchart/issues/new"
                title="GitHub"
                target="_blank"
                >意见反馈</a
              >
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <el-dialog v-model="dialogVisible" title="" width="500">
      <div class="about-content">
        <div class="about-content-logo">
          <img src="../assets/logo.jpg" alt="logo" class="logo" />
        </div>
        <div class="about-content-info">
          <div class="about-content-info-desc">
            tiny-flowchart是一款基于Canvas和Vue3打造的流程图编辑器，支持流程图的绘制、编辑、保存、导出等功能。
          </div>
          <div class="about-content-info-item">
            <div class="about-content-info-item-label">版本号：</div>
            <div class="about-content-info-item-value">{{ version }}</div>
          </div>
          <div class="about-content-info-item">
            <div class="about-content-info-item-label">作者：</div>
            <div class="about-content-info-item-value">
              <a
                target="_blank"
                href="https://github.com/astonishqft"
                class="about-content-info-author-text"
                >astonishqft</a
              >
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
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
      width: 88px;
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
  .about-content {
    display: flex;
    align-items: center;
    flex-direction: column;
    .about-content-logo {
      width: 168px;
      height: 50px;
      border-radius: 8px;
      img {
        width: 100%;
        height: 100%;
        border-radius: 10px;
      }
    }
    .about-content-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      .about-content-info-desc {
        font-size: 14px;
        color: #666;
        padding: 20px 30px;
      }
      .about-content-info-item {
        display: flex;
        align-items: center;
        width: 100%;
        .about-content-info-item-label {
          font-size: 12px;
          color: #666;
          width: 50%;
          display: flex;
          justify-content: flex-end;
        }
        .about-content-info-item-value {
          font-size: 12px;
          width: 50%;
          a {
            color: #1f1f1f;
            font-weight: 600;
          }
        }
      }
    }
  }
}
</style>
