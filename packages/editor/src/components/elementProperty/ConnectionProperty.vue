<script setup lang="ts">
import { ref } from 'vue'
import { ElSelect, ElOption, ElInputNumber, ElDivider, ElColorPicker, ElInput } from 'element-plus'
import { ConnectionType } from '@ioceditor/core'
import { convertStrokeTypeToLineDash, convertLineDashToStrokeType } from '../../utils/utils'
import { IocEditor } from '@ioceditor/core'

import type { IConnection, FontWeight, FontStyle } from '@ioceditor/core'

const { iocEditor } = defineProps<{
  iocEditor: IocEditor
}>()

const lineTypes = [
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

const activeConnection = ref<IConnection | null>(null)
const lineWidth = ref<number | undefined>(1)
const lineColor = ref<string | undefined>('#1e1e1e')
const lineDash = ref('solid')
const lineType = ref<ConnectionType>(ConnectionType.OrtogonalLine)
const lineTextContent = ref<string | undefined>(undefined)
const lineTextFontSize = ref<number | undefined>(undefined)
const lineTextFontColor = ref<string | undefined>('#333')
const fontWeight = ref<FontWeight | undefined>('normal')
const fontStyle = ref<FontStyle | undefined>('normal')

iocEditor._connectionMgr.updateSelectConnection$.subscribe((connection: IConnection) => {
  activeConnection.value = connection
  lineColor.value = connection.getLineColor()
  lineDash.value = convertLineDashToStrokeType(connection.getLineDash())
  lineWidth.value = connection.getLineWidth()
  lineType.value = connection.getLineType()
  lineTextContent.value = connection.getLineTextContent()
  lineTextFontSize.value = connection.getLineTextFontSize() as number
  lineTextFontColor.value = connection.getLineTextFontColor()
  fontStyle.value = connection.getLineFontStyle()
  fontWeight.value = connection.getLineFontWeight()
})

const lineWidthOpts = [1, 2, 3, 4, 5]
const lineDashList = [
  {
    label: '实线',
    value: 'solid'
  },
  {
    label: '虚线',
    value: 'dashed'
  },
  {
    label: '点线',
    value: 'dotted'
  }
]

const strokeColorList = ['#1e1e1e', '#e03131', '#2f9e44', '#1971c2', '#f08c00']

const changeLineColor = (color: string | null) => {
  activeConnection.value?.setLineColor(color as string)
  lineColor.value = color as string
}

const changeLineWidth = (width: number) => {
  lineWidth.value = width
  activeConnection.value?.setLineWidth(width)
}

const changeLineDash = (type: string) => {
  lineDash.value = type
  activeConnection.value?.setLineDash(convertStrokeTypeToLineDash(type))
}
const changeLinkFontColor = (color: string | null) => {
  activeConnection.value?.setLineTextFontColor(color as string)
}

const changeLineFontStyle = (style: string) => {
  const fWeight = activeConnection.value?.getLineFontWeight() || 'normal'
  const fStyle = activeConnection.value?.getLineFontStyle() || 'normal'
  if (style === 'fontWeight') {
    activeConnection.value?.setLineFontWeight(fWeight === 'normal' ? 'bold' : 'normal')

    fontWeight.value = fWeight === 'normal' ? 'bold' : 'normal'
  } else {
    activeConnection.value?.setLineFontStyle(fStyle === 'normal' ? 'italic' : 'normal')

    fontStyle.value = fStyle === 'normal' ? 'italic' : 'normal'
  }
}

const changeLineTextContent = (text: string) => {
  activeConnection.value?.setLineTextContent(text)
}

const changeLineFontSize = (size: number | undefined) => {
  activeConnection.value?.setLineTextFontSize(size)
}

const changeLineType = (type: ConnectionType) => {
  lineType.value = type
  activeConnection.value?.setLineType(type)
}
</script>
<template>
  <div class="property-container">
    <div class="property-item">
      <div class="property-name">线条颜色</div>
      <div class="property-value color-wrapper">
        <span
          class="color-item"
          :style="{ backgroundColor: color }"
          v-for="color in strokeColorList"
          :key="color"
          @click="() => changeLineColor(color)"
        />
        <el-divider style="margin: 0 4px; height: 20px" direction="vertical" />
        <el-color-picker v-model="lineColor" @change="changeLineColor" size="small" />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">线条宽度</div>
      <div class="property-value">
        <el-select
          v-model="lineWidth"
          size="small"
          style="width: 157px; margin-right: 5px"
          @change="changeLineWidth"
        >
          <el-option v-for="item in lineWidthOpts" :key="item" :label="`${item}px`" :value="item" />
        </el-select>
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">线条类型</div>
      <div class="property-value">
        <el-select
          placeholder="Select"
          v-model="lineDash"
          size="small"
          style="width: 157px; margin-right: 5px"
          @change="changeLineDash"
        >
          <el-option
            v-for="item in lineDashList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <div class="line-type" :class="item.value"></div>
          </el-option>
        </el-select>
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">连线方式</div>
      <div class="property-value">
        <el-select
          placeholder="Select"
          v-model="lineType"
          size="small"
          style="width: 157px; margin-right: 5px"
          @change="changeLineType"
        >
          <el-option
            v-for="item in lineTypes"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <div class="line-type" :class="item.value">{{ item.label }}</div>
          </el-option>
        </el-select>
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文字颜色</div>
      <div class="property-value color-wrapper">
        <span
          class="color-item"
          :style="{ backgroundColor: color }"
          v-for="color in strokeColorList"
          :key="color"
          @click="() => changeLinkFontColor(color)"
        />
        <el-divider style="margin: 0 4px; height: 20px" direction="vertical" />
        <el-color-picker v-model="lineTextFontColor" @change="changeLinkFontColor" size="small" />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文本内容</div>
      <div class="property-value">
        <el-input
          v-model="lineTextContent"
          :min="12"
          :max="30"
          size="small"
          :step="1"
          @input="changeLineTextContent"
          style="width: 157px; margin-right: 5px"
        />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文字大小</div>
      <div class="property-value">
        <el-input-number
          v-model="lineTextFontSize"
          :min="12"
          :max="30"
          size="small"
          :step="1"
          @change="changeLineFontSize"
          style="width: 157px; margin-right: 5px"
        />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文字样式</div>
      <div class="property-value">
        <span
          class="icon iconfont font-style-icon icon-zitiyangshi_jiacu"
          :class="{ active: fontWeight === 'bold' }"
          :title="'加粗'"
          @click="() => changeLineFontStyle('fontWeight')"
        />
        <span
          class="icon iconfont font-style-icon icon-zitiyangshi_xieti"
          :class="{ active: fontStyle === 'italic' }"
          :title="'斜体'"
          @click="() => changeLineFontStyle('fontStyle')"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.property-container {
  padding: 15px;
  .property-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    .property-name {
      font-size: 12px;
    }
    .color-wrapper {
      display: flex;
      align-items: center;
    }
    .property-value {
      margin-left: 15px;
      .color-item {
        width: 20px;
        height: 20px;
        margin: 3px;
        cursor: pointer;
        border-radius: 5px;
        border: 1px solid rgb(217, 217, 217);
        display: inline-block;
      }
    }
  }
}
.line-type {
  height: 15px;
}
.solid {
  border-bottom: 1px solid #000;
}
.dashed {
  border-bottom: 1px dashed #000;
}
.dotted {
  border-bottom: 1px dotted #000;
}
.font-style-icon {
  font-size: 18px;
  margin: 3.5px;
  padding: 3px;
  border: 1px solid rgb(217, 217, 217);
  border-radius: 5px;
}
.font-style-icon.active {
  background-color: #1971c2;
  color: #fff;
}
:global(.el-color-picker) {
  width: 20px;
  height: 20px;
  border: 5px;
  margin: 3px 5px 3px 3px;
}
:global(.el-color-picker__trigger) {
  padding: 0;
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 5px;
}
:global(.el-color-picker__color) {
  border-radius: 5px;
}
</style>
