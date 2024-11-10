<script setup lang="ts">
import { ref } from 'vue'
import { NodeType } from '@ioceditor/core'
import { ElSelect, ElOption, ElInputNumber, ElDivider, ElColorPicker, ElInput } from 'element-plus'
import { convertLineDashToStrokeType, convertStrokeTypeToLineDash } from '../../utils/utils'
import { IocEditor } from '@ioceditor/core'

import type {
  IShape,
  Displayable,
  BuiltinTextPosition,
  FontWeight,
  FontStyle
} from '@ioceditor/core'

const { iocEditor } = defineProps<{
  iocEditor: IocEditor
}>()

const bgColorList = ['transparent', '#ffc9c9', '#b2f2bb', '#a5d8ff', '#ffec99']
const strokeColorList = ['#1e1e1e', '#e03131', '#2f9e44', '#1971c2', '#f08c00']

const activeShape = ref<Displayable>()

interface ITextPosition {
  name: string
  icon: string
  desc: string
}

const lineWidthOpts = [1, 2, 3, 4, 5]
const lineTypeOpt = [
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

const textPositionList: ITextPosition[] = [
  {
    name: 'inside',
    icon: 'icon-sInLineVertical',
    desc: '内置'
  },
  {
    name: 'top',
    icon: 'icon-LineUp',
    desc: '置顶'
  },
  {
    name: 'right',
    icon: 'icon-LineRight',
    desc: '置右'
  },
  {
    name: 'bottom',
    icon: 'icon-LineDown',
    desc: '置底'
  },
  {
    name: 'left',
    icon: 'icon-LineLeft',
    desc: '置左'
  }
]
const lineWidth = ref(1)
const fontSize = ref(12)
const strokeType = ref('solid')
const nodeText = ref('')
const bgColor = ref('')
const strokeColor = ref('')
const fontColor = ref('')
const textPosition = <BuiltinTextPosition>ref('inside')
const fontWeight = ref<FontWeight>('normal')
const fontStyle = ref<FontStyle>('normal')

iocEditor._sceneMgr.updateSelectNode$.subscribe((shape: IShape) => {
  if (shape.nodeType === NodeType.Shape) {
    activeShape.value = shape as unknown as Displayable
    lineWidth.value = activeShape.value.style.lineWidth
    fontSize.value = activeShape.value.getTextContent().style.fontSize as number
    strokeType.value = convertLineDashToStrokeType(activeShape.value.style.lineDash || [0, 0])
    nodeText.value = activeShape.value.getTextContent().style.text || ''
    bgColor.value = activeShape.value.style.fill
    strokeColor.value = activeShape.value.style.stroke
    fontColor.value = activeShape.value.getTextContent().style.fill || '#333'
    textPosition.value = activeShape.value.textConfig?.position || 'inside'
    fontStyle.value = activeShape.value.getTextContent().style.fontStyle || 'normal'
    fontWeight.value = activeShape.value.getTextContent().style.fontWeight || 'normal'
  }
})

const changeShapeBgColor = (color: string | null) => {
  activeShape.value!.setStyle({
    fill: color
  })
  bgColor.value = color as string
}

const changeShapeStrokeColor = (color: string | null) => {
  activeShape.value!.setStyle({
    stroke: color
  })
  strokeColor.value = color as string
}

const changeShapeFontColor = (color: string | null) => {
  if (!color) return
  activeShape.value!.getTextContent()?.setStyle({
    fill: color
  })
  fontColor.value = color as string
}

const changeShapeFontSize = (size: number | undefined) => {
  if (!size) return
  activeShape.value!.getTextContent()?.setStyle({
    fontSize: size
  })

  fontSize.value = size
}

const changeShapeLineWidth = (width: number) => {
  activeShape.value!.setStyle({
    lineWidth: width
  })
  lineWidth.value = width
}

const changeShapeStrokeType = (type: string) => {
  activeShape.value!.setStyle({
    lineDash: convertStrokeTypeToLineDash(type)
  })

  strokeType.value = type
}

const changeShapeTextPosition = (position: BuiltinTextPosition) => {
  activeShape.value!.setTextConfig({
    position
  })

  textPosition.value = position
}

const changeShapeFontStyle = (style: string) => {
  const fWeight = activeShape.value!.getTextContent().style.fontWeight || 'normal'
  const fStyle = activeShape.value!.getTextContent().style.fontStyle || 'normal'
  if (style === 'fontWeight') {
    activeShape.value!.getTextContent()?.setStyle({
      fontWeight: fWeight === 'normal' ? 'bold' : 'normal'
    })

    fontWeight.value = fWeight === 'normal' ? 'bold' : 'normal'
  } else {
    activeShape.value!.getTextContent()?.setStyle({
      fontStyle: fStyle === 'normal' ? 'italic' : 'normal'
    })

    fontStyle.value = fStyle === 'normal' ? 'italic' : 'normal'
  }
}

const changeShapeText = (text: string) => {
  activeShape.value!.getTextContent()?.setStyle({
    text
  })

  nodeText.value = text
}
</script>
<template>
  <div class="property-container">
    <div class="property-item">
      <div class="property-name">背景色</div>
      <div class="property-value color-wrapper">
        <span
          class="color-item"
          :style="{ backgroundColor: color }"
          v-for="color in bgColorList"
          :key="color"
          @click="() => changeShapeBgColor(color)"
        />
        <el-divider style="margin: 0 4px; height: 20px" direction="vertical" />
        <el-color-picker v-model="bgColor" @change="changeShapeBgColor" size="small" />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">边框颜色</div>
      <div class="property-value color-wrapper">
        <span
          class="color-item"
          :style="{ backgroundColor: color }"
          v-for="color in strokeColorList"
          :key="color"
          @click="() => changeShapeStrokeColor(color)"
        />
        <el-divider style="margin: 0 4px; height: 20px" direction="vertical" />
        <el-color-picker v-model="strokeColor" @change="changeShapeStrokeColor" size="small" />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">边框宽度</div>
      <div class="property-value">
        <el-select
          v-model="lineWidth"
          size="small"
          style="width: 157px; margin-right: 5px"
          @change="changeShapeLineWidth"
        >
          <el-option v-for="item in lineWidthOpts" :key="item" :label="`${item}px`" :value="item" />
        </el-select>
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">边框类型</div>
      <div class="property-value">
        <el-select
          placeholder="Select"
          v-model="strokeType"
          size="small"
          style="width: 157px; margin-right: 5px"
          @change="changeShapeStrokeType"
        >
          <el-option
            v-for="item in lineTypeOpt"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <div class="line-type" :class="item.value" />
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
          @click="() => changeShapeFontColor(color)"
        />
        <el-divider style="margin: 0 4px; height: 20px" direction="vertical" />
        <el-color-picker v-model="fontColor" @change="changeShapeFontColor" size="small" />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文本内容</div>
      <div class="property-value">
        <el-input
          v-model="nodeText"
          :min="12"
          :max="30"
          size="small"
          :step="1"
          @input="changeShapeText"
          style="width: 157px; margin-right: 5px"
        />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文字大小</div>
      <div class="property-value">
        <el-input-number
          v-model="fontSize"
          :min="12"
          :max="30"
          size="small"
          :step="1"
          @change="changeShapeFontSize"
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
          @click="() => changeShapeFontStyle('fontWeight')"
        />
        <span
          class="icon iconfont font-style-icon icon-zitiyangshi_xieti"
          :class="{ active: fontStyle === 'italic' }"
          :title="'斜体'"
          @click="() => changeShapeFontStyle('fontStyle')"
        />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文字位置</div>
      <div class="property-value">
        <span
          class="icon iconfont position-icon"
          :class="[position.icon, { active: textPosition === position.name }]"
          v-for="position in textPositionList"
          :key="position.name"
          :title="position.desc"
          @click="() => changeShapeTextPosition(position.name)"
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
.position-icon {
  font-size: 18px;
  margin: 3.5px;
  padding: 3px;
  border: 1px solid rgb(217, 217, 217);
  border-radius: 5px;
  &:hover {
    cursor: pointer;
    background-color: #eeeeee;
    color: #5cb6ff;
  }
}
.position-icon.active {
  background-color: #1971c2;
  color: #fff;
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
