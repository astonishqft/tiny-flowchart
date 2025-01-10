<script setup lang="ts">
import { ref } from 'vue'
import { NodeType } from '@ioceditor/core'
import { ElColorPicker, ElDivider, ElInput, ElInputNumber, ElOption, ElSelect } from 'element-plus'
import { IocEditor } from '@ioceditor/core'
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
  INodeGroup,
  IExportShapeStyle,
  LineDashStyle
} from '@ioceditor/core'

const { iocEditor } = defineProps<{
  iocEditor: IocEditor
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
  textPosition: 'inside'
})

iocEditor._sceneMgr.updateSelectNode$.subscribe((shape: IShape | INodeGroup) => {
  if (shape.nodeType === NodeType.Shape) {
    activeShape.value = shape as IShape
    shapeConfig.value.fill = activeShape.value.style.fill
    shapeConfig.value.stroke = activeShape.value.style.stroke
    shapeConfig.value.lineWidth = activeShape.value.style.lineWidth
    shapeConfig.value.lineDash = activeShape.value.style.lineDash || 'solid'

    shapeConfig.value.text = activeShape.value.getTextContent().style.text || ''
    shapeConfig.value.fontColor = activeShape.value.getTextContent().style.fill || '#333'
    shapeConfig.value.fontSize = activeShape.value.getTextContent().style.fontSize as number
    shapeConfig.value.fontStyle = activeShape.value.getTextContent().style.fontStyle || 'normal'
    shapeConfig.value.fontWeight = activeShape.value.getTextContent().style.fontWeight || 'normal'
    shapeConfig.value.textPosition = activeShape.value.textConfig?.position || 'inside'
  }
})

const changeShapeBgColor = (color: string | null) => {
  const oldShapeConfig = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.fill = color as string
  iocEditor.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeConfig: { ...shapeConfig.value },
    oldShapeConfig
  })
}

const changeShapeStrokeColor = (color: string | null) => {
  const oldShapeConfig = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.stroke = color as string
  iocEditor.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeConfig: { ...shapeConfig.value },
    oldShapeConfig
  })
}

const changeShapeFontColor = (color: string | null) => {
  if (!color) return
  const oldShapeConfig = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.fontColor = color as string
  iocEditor.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeConfig: { ...shapeConfig.value },
    oldShapeConfig
  })
}

const changeShapeFontSize = (size: number | undefined) => {
  if (!size) return
  const oldShapeConfig = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.fontSize = size
  iocEditor.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeConfig: { ...shapeConfig.value },
    oldShapeConfig
  })
}

const changeShapeLineWidth = (width: number) => {
  const oldShapeConfig = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.lineWidth = width
  iocEditor.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeConfig: { ...shapeConfig.value },
    oldShapeConfig
  })
}

const changeShapeStrokeType = (type: string) => {
  const oldShapeConfig = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.lineDash = type as LineDashStyle
  iocEditor.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeConfig: { ...shapeConfig.value },
    oldShapeConfig
  })
}

const changeShapeTextPosition = (position: BuiltinTextPosition) => {
  const oldShapeConfig = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.textPosition = position
  iocEditor.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeConfig: { ...shapeConfig.value },
    oldShapeConfig
  })
}

const changeShapeFontStyle = (style: string) => {
  const fWeight = activeShape.value!.getTextContent().style.fontWeight
  const fStyle = activeShape.value!.getTextContent().style.fontStyle
  const oldShapeConfig = { ...activeShape.value!.getExportData().style }
  if (style === 'fontWeight') {
    shapeConfig.value.fontWeight = fWeight === 'normal' ? 'bold' : 'normal'
    iocEditor.execute('updateShapeProperty', {
      shape: activeShape.value as IShape,
      shapeConfig: { ...shapeConfig.value },
      oldShapeConfig
    })
  } else {
    shapeConfig.value.fontStyle = fStyle === 'normal' ? 'italic' : 'normal'
    iocEditor.execute('updateShapeProperty', {
      shape: activeShape.value as IShape,
      shapeConfig: { ...shapeConfig.value },
      oldShapeConfig
    })
  }
}

const changeShapeText = (text: string) => {
  const oldShapeConfig = { ...activeShape.value!.getExportData().style }
  shapeConfig.value.text = text
  iocEditor.execute('updateShapeProperty', {
    shape: activeShape.value as IShape,
    shapeConfig: { ...shapeConfig.value },
    oldShapeConfig
  })
}
</script>
<template>
  <div class="property-container">
    <div class="property-item" v-if="activeShape?.type !== 'image'">
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
    <div class="property-item" v-if="activeShape?.type !== 'image'">
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
    <div class="property-item" v-if="activeShape?.type !== 'image'">
      <div class="property-name">边框宽度</div>
      <div class="property-value">
        <el-select
          v-model="shapeConfig.lineWidth"
          size="small"
          style="width: 157px; margin-right: 5px"
          @change="changeShapeLineWidth"
        >
          <el-option v-for="item in lineWidthOpts" :key="item" :label="`${item}px`" :value="item" />
        </el-select>
      </div>
    </div>
    <div class="property-item" v-if="activeShape?.type !== 'image'">
      <div class="property-name">边框类型</div>
      <div class="property-value">
        <el-select
          placeholder="Select"
          v-model="shapeConfig.lineDash"
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
        <el-color-picker
          v-model="shapeConfig.fontColor"
          @change="changeShapeFontColor"
          size="small"
        />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文本内容</div>
      <div class="property-value">
        <el-input
          v-model="shapeConfig.text"
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
          v-model="shapeConfig.fontSize"
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
          :class="{ active: shapeConfig.fontWeight === 'bold' }"
          :title="'加粗'"
          @click="() => changeShapeFontStyle('fontWeight')"
        />
        <span
          class="icon iconfont font-style-icon icon-zitiyangshi_xieti"
          :class="{ active: shapeConfig.fontStyle === 'italic' }"
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
          :class="[position.icon, { active: shapeConfig.textPosition === position.name }]"
          v-for="position in textPositionList"
          :key="position.name"
          :title="position.desc"
          @click="() => changeShapeTextPosition(position.name as BuiltinTextPosition)"
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
