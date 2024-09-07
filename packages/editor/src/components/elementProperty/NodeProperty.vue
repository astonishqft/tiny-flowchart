<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElSelect, ElInputNumber, ElDivider, ElColorPicker, ElInput } from 'element-plus'

interface ITextPosition {
  name: string
  icon: string
  desc: string
}

// watch(
//   () => editorStore.selectedShape,
//   (newValue) => {
//     lineWidth.value = newValue?.lineWidth || 1
//     fontSize.value = newValue?.fontSize || 12
//     strokeType.value = newValue?.strokeType || 'solid'
//     fontSize.value = newValue?.fontSize || 12
//     currentPosition.value = newValue?.textPosition || 'inside'
//     nodeText.value = newValue?.nodeText || ''
//     fontColor.value = newValue?.fontColor || '#333'
//     bgColor.value = newValue?.fillColor || undefined
//     strokeColor.value = newValue?.strokeColor || undefined
//   }
// )

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
const fontStyle = [
  {
    name: 'fontItalic',
    icon: 'icon-zitiyangshi_xieti',
    desc: '斜体'
  },
  {
    name: 'fontWeight',
    icon: 'icon-zitiyangshi_jiacu',
    desc: '加粗'
  }
]
const textPosition: ITextPosition[] = [
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

const bgColorList = ['transparent', '#ffc9c9', '#b2f2bb', '#a5d8ff', '#ffec99']
const strokeColorList = ['#1e1e1e', '#e03131', '#2f9e44', '#1971c2', '#f08c00']
// const lineWidth = ref(propertyStore.shapeLineWidth || 1)
// const fontSize = ref(propertyStore.shapeFontSize || 12)
// const strokeType = ref(propertyStore.shapeStrokeType || 'solid')
// const currentPosition = ref(propertyStore.shapeTextPosition || 'inside')
// const nodeText = ref(propertyStore.shapeText || '')
// const bgColor = ref(propertyStore.shapeBgColor || undefined)
// const strokeColor = ref(propertyStore.shapeStrokeColor || undefined)
// const fontColor = ref(propertyStore.shapeFontColor || '#333')

const changeShapeBgColor = (color: string | null) => {
  propertyStore.setShapeBgColor(color)
  bgColor.value = color as string
}

const changeShapeStrokeColor = (color: string | null) => {
  propertyStore.setShapeStrokeColor(color)
  strokeColor.value = color as string
}

const changeShapeFontColor = (color: string | null) => {
  propertyStore.setShapeFontColor(color as string)
  fontColor.value = color as string
}

const changeShapeFontSize = (size: number | undefined) => {
  propertyStore.setShapeFontSize(size as number)
}

const changeShapeLineWidth = (width: number) => {
  propertyStore.setShapeLineWidth(width)
}

const changeShapeStrokeType = (type: string) => {
  propertyStore.setShapeStrokeType(type)
}

const changeShapeTextPosition = (position: tinyEditor.BuiltinTextPosition) => {
  propertyStore.setShapeTextPosition(position)
  currentPosition.value = position
}

const changeShapeFontStyle = (style: string) => {
  if (style === 'fontWeight') {
    propertyStore.setShapeFontWeight()
  } else {
    propertyStore.setShapeFontItalic()
  }
}

const changeShapeText = (text: string) => {
  propertyStore.setShapeText(text)
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
        <el-color-picker v-model="bgColor" @change="changeShapeBgColor" />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">线条颜色</div>
      <div class="property-value color-wrapper">
        <span
          class="color-item"
          :style="{ backgroundColor: color }"
          v-for="color in strokeColorList"
          :key="color"
          @click="() => changeShapeStrokeColor(color)"
        />
        <el-divider style="margin: 0 4px; height: 20px" direction="vertical" />
        <el-color-picker v-model="strokeColor" @change="changeShapeStrokeColor" />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">线条宽度</div>
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
      <div class="property-name">线条类型</div>
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
        <el-color-picker v-model="fontColor" @change="changeShapeFontColor" />
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
          class="icon iconfont font-style-icon"
          :class="[style.icon]"
          v-for="style in fontStyle"
          :key="style.name"
          :title="style.desc"
          @click="() => changeShapeFontStyle(style.name)"
        />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文字位置</div>
      <div class="property-value">
        <span
          class="icon iconfont position-icon"
          :class="[position.icon, { active: currentPosition === position.name }]"
          v-for="position in textPosition"
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
