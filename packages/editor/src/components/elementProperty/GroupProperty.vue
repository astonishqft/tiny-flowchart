<script setup lang="ts">
import { ref } from 'vue'
import { ElSelect, ElOption, ElInputNumber, ElDivider, ElColorPicker, ElInput } from 'element-plus'
import { convertLineDashToStrokeType, convertStrokeTypeToLineDash } from '../../utils/utils'

import type { INodeGroup, BuiltinTextPosition, FontWeight, FontStyle, IocEditor } from '@ioceditor/core'

const { iocEditor } = defineProps<{
  iocEditor: IocEditor
}>()

const bgColorList = ['transparent', '#ffc9c9', '#b2f2bb', '#a5d8ff', '#ffec99']
const strokeColorList = ['#1e1e1e', '#e03131', '#2f9e44', '#1971c2', '#f08c00']

const activeGroup = ref<INodeGroup>()

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
    name: 'insideLeft',
    icon: 'icon-align-left',
    desc: '居左'
  },
  {
    name: 'inside',
    icon: 'icon-align-center',
    desc: '居中'
  },
  {
    name: 'insideRight',
    icon: 'icon-align-right',
    desc: '居右'
  },
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

iocEditor._groupMgr.updateSelectGroup$.subscribe((group: INodeGroup) => {
  activeGroup.value = group
  bgColor.value = activeGroup.value.groupRect?.style.fill as string
  strokeColor.value = activeGroup.value.groupRect?.style.stroke as string
  fontColor.value = activeGroup.value.groupHead?.getTextContent().style.fill || '#333'
  lineWidth.value = activeGroup.value.groupRect?.style.lineWidth || 1
  strokeType.value = convertLineDashToStrokeType(activeGroup.value.groupRect?.style.lineDash as number[] || [0, 0])
  nodeText.value = activeGroup.value.groupHead?.getTextContent().style.text || ''
  fontSize.value = activeGroup.value.groupHead?.getTextContent().style.fontSize as number
  fontStyle.value = activeGroup.value.groupHead?.getTextContent().style.fontStyle || 'normal'
  fontWeight.value = activeGroup.value.groupHead?.getTextContent().style.fontWeight || 'normal'
  textPosition.value = activeGroup.value.groupHead?.textConfig?.position || 'insideLeft'
})

const changeGroupBgColor = (color: string | null) => {
  activeGroup.value!.groupRect?.setStyle({
    fill: color as string
  })
  bgColor.value = color as string
}

const changeGroupStrokeColor = (color: string | null) => {
  activeGroup.value!.groupRect?.setStyle({
    stroke: color as string
  })
  strokeColor.value = color as string
}

const changeGroupHeadFontColor = (color: string | null) => {
  if (!color) return
  activeGroup.value!.groupHead?.getTextContent()?.setStyle({
    fill: color
  })
  fontColor.value = color as string
}

const changeGroupFontSize = (size: number | undefined) => {
  if (!size) return
  activeGroup.value!.groupHead?.getTextContent()?.setStyle({
    fontSize: size
  })

  fontSize.value = size
}

const changeGroupLineWidth = (width: number) => {
  activeGroup.value!.groupRect?.setStyle({
    lineWidth: width
  })
  lineWidth.value = width
}

const changeGroupStrokeType = (type: string) => {
  activeGroup.value!.groupRect?.setStyle({
    lineDash: convertStrokeTypeToLineDash(type)
  })

  strokeType.value = type
}

const changeGroupTextPosition = (position: BuiltinTextPosition) => {
  activeGroup.value!.groupHead?.setTextConfig({
    position
  })

  textPosition.value = position
}

const changeGroupFontStyle = (style: string) => {
  const fWeight = activeGroup.value!.groupHead?.getTextContent().style.fontWeight || 'normal'
  const fStyle = activeGroup.value!.groupHead?.getTextContent().style.fontStyle || 'normal'
  if (style === 'fontWeight') {
    activeGroup.value!.groupHead?.getTextContent()?.setStyle({
      fontWeight: fWeight === 'normal' ? 'bold' : 'normal'
    })

    fontWeight.value = fWeight === 'normal' ? 'bold' : 'normal'
  } else {
    activeGroup.value!.groupHead?.getTextContent()?.setStyle({
      fontStyle: fStyle === 'normal' ? 'italic' : 'normal'
    })

    fontStyle.value = fStyle === 'normal' ? 'italic' : 'normal'
  }
}

const changeGroupText = (text: string) => {
  activeGroup.value!.groupHead?.getTextContent()?.setStyle({
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
          @click="() => changeGroupBgColor(color)"
        />
        <el-divider style="margin: 0 4px; height: 20px" direction="vertical" />
        <el-color-picker v-model="bgColor" @change="changeGroupBgColor" size="small" />
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
          @click="() => changeGroupStrokeColor(color)"
        />
        <el-divider style="margin: 0 4px; height: 20px" direction="vertical" />
        <el-color-picker v-model="strokeColor" @change="changeGroupStrokeColor" size="small"  />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">边框宽度</div>
      <div class="property-value">
        <el-select
          v-model="lineWidth"
          size="small"
          style="width: 157px; margin-right: 5px"
          @change="changeGroupLineWidth"
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
          @change="changeGroupStrokeType"
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
          @click="() => changeGroupHeadFontColor(color)"
        />
        <el-divider style="margin: 0 4px; height: 20px" direction="vertical" />
        <el-color-picker v-model="fontColor" @change="changeGroupHeadFontColor" size="small" />
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
          @input="changeGroupText"
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
          @change="changeGroupFontSize"
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
          @click="() => changeGroupFontStyle('fontWeight')"
        />
        <span
          class="icon iconfont font-style-icon icon-zitiyangshi_xieti"
          :class="{ active: fontStyle === 'italic' }"
          :title="'斜体'"
          @click="() => changeGroupFontStyle('fontStyle')"
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
          @click="() => changeGroupTextPosition(position.name)"
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
