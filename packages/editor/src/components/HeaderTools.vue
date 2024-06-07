<script setup lang="ts">
import { ref } from 'vue'
import { ElSelect, ElOption } from 'element-plus'
import 'element-plus/es/components/select/style/css'

const currentLineType = ref('ortogonalLine')

const toolsConfig = ref([
  {
    name: 'save',
    icon: 'icon-save',
    desc: '保存为文件',
    disabled: true
  },
  {
    name: 'open-file',
    icon: 'icon-folder-open',
    desc: '打开文件',
    disabled: false
  },
  {
    name: 'save-to-picture',
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
    name: 'zoom-in',
    icon: 'icon-zoomin',
    desc: '放大',
    disabled: false
  },
  {
    name: 'zoom-out',
    icon: 'icon-zoomout',
    desc: '缩小',
    disabled: false
  },
  {
    name: 'clear',
    icon: 'icon-clear',
    desc: '清除画布',
    disabled: true
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
    value: 'ortogonalLine',
    label: '折线'
  },
  {
    value: 'line',
    label: '直线'
  },
  {
    value: 'bezierCurve',
    label: '曲线'
  }
]

const changeLineType = (value: string) => {
  currentLineType.value = value
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
