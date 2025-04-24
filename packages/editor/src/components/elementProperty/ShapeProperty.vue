<script setup lang="ts">
import { ref } from 'vue'
import { NodeType, BoundingRect } from '@tiny-flowchart/core'
import { ElColorPicker, ElDivider, ElInput, ElInputNumber, ElOption, ElSelect } from 'element-plus'
import { TinyFlowchart } from '@tiny-flowchart/core'
import {
  bgColorList,
  strokeColorList,
  lineWidthOpts,
  lineTypeOpt,
  textPositionList
} from './config'

import type {
  BuiltinTextPosition,
  IShape,
  IExportShapeStyle,
  LineDashStyle,
  INodeMouseDown
} from '@tiny-flowchart/core'

const { tinyFlowchart } = defineProps<{
  tinyFlowchart: TinyFlowchart
}>()

const activeShape = ref<IShape>()

const shapeConfig = ref<IExportShapeStyle>({
  fill: '#fff',
  stroke: '#333',
  lineWidth: 1,
  lineDash: 'solid',
  text: 'title',
  fontColor: '#333',
  fontSize: 12,
  fontStyle: 'normal',
  fontWeight: 'normal',
  textPosition: 'inside',
  backgroundColor: '#fff'
})

tinyFlowchart._nodeEventMgr.updateNodeClick$.subscribe(({ node }: INodeMouseDown) => {
  if (node?.nodeType === NodeType.Shape) {
    activeShape.value = node as IShape
    if (activeShape.value.type === 'text') {
      shapeConfig.value.fontColor = activeShape.value.style.fill
      shapeConfig.value.fontSize = activeShape.value.style.fontSize as number
      shapeConfig.value.text = activeShape.value.style.text
      shapeConfig.value.fontStyle = activeShape.value.style.fontStyle
      shapeConfig.value.fontWeight = activeShape.value.style.fontWeight
      shapeConfig.value.backgroundColor = activeShape.value.style.backgroundColor
    } else {
      shapeConfig.value.fill = activeShape.value.style.fill
      shapeConfig.value.stroke = activeShape.value.style.stroke
      shapeConfig.value.lineWidth = activeShape.value.style.lineWidth
      shapeConfig.value.lineDash = activeShape.value.style.lineDash || 'solid'
      shapeConfig.value.text = activeShape.value.getTextContent()?.style.text
      shapeConfig.value.fontColor = activeShape.value.getTextContent()?.style.fill
      shapeConfig.value.fontSize = activeShape.value.getTextContent()?.style.fontSize as number
      shapeConfig.value.fontStyle = activeShape.value.getTextContent()?.style.fontStyle
      shapeConfig.value.fontWeight = activeShape.value.getTextContent()?.style.fontWeight
      shapeConfig.value.textPosition = activeShape.value.textConfig?.position
    }
  }
})

const changeShapeBgColor = (color: string | null) => {
  const oldShapeStyle = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.fill = color as string
  tinyFlowchart.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeStyle: { ...oldShapeStyle, fill: color as string },
    oldShapeStyle
  })
}

const changeShapeStrokeColor = (color: string | null) => {
  const oldShapeStyle = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.stroke = color as string
  tinyFlowchart.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeStyle: { ...oldShapeStyle, stroke: color as string },
    oldShapeStyle
  })
}

const changeShapeFontColor = (color: string | null) => {
  if (!color) return
  const oldShapeStyle = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.fontColor = color as string
  tinyFlowchart.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeStyle: { ...oldShapeStyle, fontColor: color },
    oldShapeStyle
  })
}

// 更新 Text 节点的颜色
const changeTextColor = (color: string | null) => {
  if (!color) return
  const oldShapeStyle = { ...activeShape.value!.getExportData().style }

  shapeConfig.value.fontColor = color as string
  tinyFlowchart.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeStyle: { ...oldShapeStyle, fill: color },
    oldShapeStyle
  })
}

// 更新 Text 节点的字体背景色
const changeTextBgColor = (color: string | null) => {
  if (!color) return
  const oldShapeStyle = { ...activeShape.value!.getExportData().style }

  shapeConfig.value.fontColor = color as string
  tinyFlowchart.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeStyle: { ...oldShapeStyle, backgroundColor: color },
    oldShapeStyle
  })
}

// 更新 Text 节点的字体大小
const changeTextFontSize = (size: number | undefined) => {
  if (!size) return
  const oldShapeStyle = { ...activeShape.value!.getExportData().style }

  shapeConfig.value.fontSize = size
  tinyFlowchart.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeStyle: { ...oldShapeStyle, fontSize: size },
    oldShapeStyle
  })

  updateTextAnchorAndCtrFrame()
}

// 更新 Text 节点的文本字体风格
const changeTextFontStyle = (style: string) => {
  const fWeight = activeShape.value!.style.fontWeight
  const fStyle = activeShape.value!.style.fontStyle
  const oldShapeStyle = { ...activeShape.value!.getExportData().style }
  if (style === 'fontWeight') {
    shapeConfig.value.fontWeight = fWeight === 'normal' ? 'bold' : 'normal'
    tinyFlowchart.execute('updateShapeProperty', {
      shape: activeShape.value as IShape,
      shapeStyle: { ...oldShapeStyle, fontWeight: shapeConfig.value.fontWeight },
      oldShapeStyle
    })
  } else {
    shapeConfig.value.fontStyle = fStyle === 'normal' ? 'italic' : 'normal'
    tinyFlowchart.execute('updateShapeProperty', {
      shape: activeShape.value as IShape,
      shapeStyle: { ...oldShapeStyle, fontStyle: shapeConfig.value.fontStyle },
      oldShapeStyle
    })
  }
}

const updateTextAnchorAndCtrFrame = () => {
  const { width, height } = activeShape.value!.getBoundingRect()
  const { x, y } = activeShape.value!
  tinyFlowchart._controlFrameMgr.reSizeNode(new BoundingRect(x, y, width, height))
  activeShape.value?.anchor.refresh()
}

// 更新 Text 节点的文本内容
const changeText = (text: string) => {
  const oldShapeStyle = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.text = text
  tinyFlowchart.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeStyle: { ...oldShapeStyle, text },
    oldShapeStyle
  })

  updateTextAnchorAndCtrFrame()
}

const changeShapeFontSize = (size: number | undefined) => {
  if (!size) return
  const oldShapeStyle = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.fontSize = size
  tinyFlowchart.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeStyle: { ...oldShapeStyle, fontSize: size },
    oldShapeStyle
  })
}

const changeShapeLineWidth = (width: number) => {
  const oldShapeStyle = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.lineWidth = width
  tinyFlowchart.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeStyle: { ...oldShapeStyle, lineWidth: width },
    oldShapeStyle
  })
}

const changeShapeStrokeType = (type: string) => {
  const oldShapeStyle = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.lineDash = type as LineDashStyle
  tinyFlowchart.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeStyle: { ...oldShapeStyle, lineDash: type as LineDashStyle },
    oldShapeStyle
  })
}

const changeShapeTextPosition = (position: BuiltinTextPosition) => {
  const oldShapeStyle = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.textPosition = position
  tinyFlowchart.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeStyle: { ...oldShapeStyle, textPosition: position },
    oldShapeStyle
  })
}

const changeShapeFontStyle = (style: string) => {
  const fWeight = activeShape.value!.getTextContent().style.fontWeight
  const fStyle = activeShape.value!.getTextContent().style.fontStyle
  const oldShapeStyle = { ...activeShape.value!.getExportData().style }
  if (style === 'fontWeight') {
    shapeConfig.value.fontWeight = fWeight === 'normal' ? 'bold' : 'normal'
    tinyFlowchart.execute('updateShapeProperty', {
      shape: activeShape.value as IShape,
      shapeStyle: { ...oldShapeStyle, fontWeight: shapeConfig.value.fontWeight },
      oldShapeStyle
    })
  } else {
    shapeConfig.value.fontStyle = fStyle === 'normal' ? 'italic' : 'normal'
    tinyFlowchart.execute('updateShapeProperty', {
      shape: activeShape.value as IShape,
      shapeStyle: { ...oldShapeStyle, fontStyle: shapeConfig.value.fontStyle },
      oldShapeStyle
    })
  }
}

const changeShapeText = (text: string) => {
  const oldShapeStyle = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.text = text
  tinyFlowchart.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeStyle: { ...oldShapeStyle, text },
    oldShapeStyle
  })
}
</script>
<template>
  <div class="property-container">
    <div class="property-item" v-if="!['image', 'text'].includes(activeShape?.type as string)">
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
        <el-color-picker
          v-model="shapeConfig.fill as string"
          @change="changeShapeBgColor"
          size="small"
        />
      </div>
    </div>
    <div class="property-item" v-if="activeShape?.type === 'text'">
      <div class="property-name">文本背景色</div>
      <div class="property-value color-wrapper">
        <span
          class="color-item"
          :style="{ backgroundColor: color }"
          v-for="color in bgColorList"
          :key="color"
          @click="() => changeTextBgColor(color)"
        />
        <el-divider style="margin: 0 4px; height: 20px" direction="vertical" />
        <el-color-picker
          v-model="shapeConfig.backgroundColor as string"
          @change="changeTextBgColor"
          size="small"
        />
      </div>
    </div>
    <div class="property-item" v-if="!['image', 'text'].includes(activeShape?.type as string)">
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
        <el-color-picker
          v-model="shapeConfig.stroke as string"
          @change="changeShapeStrokeColor"
          size="small"
        />
      </div>
    </div>
    <div class="property-item" v-if="!['image', 'text'].includes(activeShape?.type as string)">
      <div class="property-name">边框宽度</div>
      <div class="property-value">
        <el-select
          v-model="shapeConfig.lineWidth"
          size="small"
          @change="changeShapeLineWidth"
          style="margin-left: 2px"
        >
          <el-option v-for="item in lineWidthOpts" :key="item" :label="`${item}px`" :value="item" />
        </el-select>
      </div>
    </div>
    <div class="property-item" v-if="!['image', 'text'].includes(activeShape?.type as string)">
      <div class="property-name">边框类型</div>
      <div class="property-value">
        <el-select
          placeholder="Select"
          v-model="shapeConfig.lineDash"
          size="small"
          @change="changeShapeStrokeType"
          style="margin-left: 2px"
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
    <div class="property-item" v-if="activeShape?.type !== 'text' && shapeConfig.fontColor">
      <div class="property-name">文本颜色</div>
      <div class="property-value color-wrapper">
        <span
          class="color-item"
          :style="{ backgroundColor: color }"
          v-for="color in strokeColorList"
          :key="color"
          @click="() => changeShapeFontColor(color)"
        />
        <el-divider style="margin: 0 4px; height: 20px" direction="vertical" />
        <el-color-picker
          v-model="shapeConfig.fontColor"
          @change="changeShapeFontColor"
          size="small"
        />
      </div>
    </div>
    <div class="property-item" v-if="activeShape?.type === 'text'">
      <div class="property-name">文本颜色</div>
      <div class="property-value color-wrapper">
        <span
          class="color-item"
          :style="{ backgroundColor: color }"
          v-for="color in strokeColorList"
          :key="color"
          @click="() => changeTextColor(color)"
        />
        <el-divider style="margin: 0 4px; height: 20px" direction="vertical" />
        <el-color-picker
          v-model="shapeConfig.fill as string"
          @change="changeTextColor"
          size="small"
        />
      </div>
    </div>
    <div class="property-item" v-if="shapeConfig.text">
      <div class="property-name">文本内容</div>
      <div class="property-value">
        <el-input
          v-model="shapeConfig.text"
          size="small"
          @input="text => (activeShape?.type === 'text' ? changeText(text) : changeShapeText(text))"
          style="margin-left: 2px"
        />
      </div>
    </div>
    <div class="property-item" v-if="shapeConfig.fontSize">
      <div class="property-name">文本大小</div>
      <div class="property-value">
        <el-input-number
          v-model="shapeConfig.fontSize"
          :min="12"
          :max="60"
          size="small"
          :step="1"
          @change="
            size =>
              activeShape?.type === 'text' ? changeTextFontSize(size) : changeShapeFontSize(size)
          "
          style="margin-left: 2px; width: 100%"
        />
      </div>
    </div>
    <div class="property-item" v-if="shapeConfig.fontWeight">
      <div class="property-name">文本样式</div>
      <div class="property-value">
        <span
          class="icon iconfont font-style-icon icon-zitiyangshi_jiacu"
          :class="{ active: shapeConfig.fontWeight === 'bold' }"
          :title="'加粗'"
          @click="
            () =>
              activeShape?.type === 'text'
                ? changeTextFontStyle('fontWeight')
                : changeShapeFontStyle('fontWeight')
          "
          style="margin-left: 2px"
        />
        <span
          class="icon iconfont font-style-icon icon-zitiyangshi_xieti"
          :class="{ active: shapeConfig.fontStyle === 'italic' }"
          :title="'斜体'"
          @click="
            () =>
              activeShape?.type === 'text'
                ? changeTextFontStyle('fontStyle')
                : changeShapeFontStyle('fontStyle')
          "
        />
      </div>
    </div>
    <div class="property-item" v-if="activeShape?.type !== 'text' && shapeConfig.text">
      <div class="property-name">文本位置</div>
      <div class="property-value">
        <span
          class="icon iconfont position-icon"
          :class="[position.icon, { active: shapeConfig.textPosition === position.name }]"
          v-for="position in textPositionList"
          :key="position.name"
          :title="position.desc"
          @click="() => changeShapeTextPosition(position.name as BuiltinTextPosition)"
          style="margin-left: 2px"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.property-container {
  padding: 10px 15px 10px 15px;
  .property-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    width: 100%;
    .property-name {
      width: 58px;
      font-size: 12px;
      display: flex;
      justify-content: flex-start;
    }
    .color-wrapper {
      display: flex;
      width: calc(100% - 58px);
      justify-content: space-between;
    }
    .property-value {
      width: calc(100% - 58px);
      .color-item {
        width: 20px;
        height: 20px;
        margin: 2px;
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
  padding: 3px;
  border: 1px solid rgb(217, 217, 217);
  border-radius: 5px;
  margin-right: 8px;
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
  margin-right: 8px;
  padding: 3px;
  border: 1px solid rgb(217, 217, 217);
  border-radius: 5px;
}
.font-style-icon.active {
  background-color: #1971c2;
  color: #fff;
}
</style>
