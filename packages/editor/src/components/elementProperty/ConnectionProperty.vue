<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElSelect, ElInputNumber, ElDivider, ElColorPicker, ElInput } from 'element-plus'

const lineTypes = [
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

// watch(
//   () => editorStore.selectedLink,
//   (newValue) => {
//     strokeColor.value = newValue?.strokeLinkColor || '#1e1e1e'
//     linkWidth.value = newValue?.linkWidth || 1
//     linkStrokeType.value = newValue?.linkStrokeType || 'solid'
//     linkFontColor.value = newValue?.linkFontColor || '#333'
//     linkFontSize.value = newValue?.linkFontSize || 12
//     linkFontText.value = newValue?.linkFontText || ''
//     shapeLinkType.value = newValue?.lineType || 'ortogonalLine'
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

// const strokeColorList = ['#1e1e1e', '#e03131', '#2f9e44', '#1971c2', '#f08c00']
// const linkWidth = ref(propertyStore.linkWidth || 1)
// const linkFontSize = ref(propertyStore.linkFontSize || 12)
// const linkStrokeType = ref(propertyStore.linkStrokeType || 'solid')
// const shapeLinkType = ref(propertyStore.shapeLinkType || 'ortogonalLine')
// const linkFontText = ref(propertyStore.linkFontText || '')
// const strokeColor = ref(propertyStore.linkStrokeColor || '#1e1e1e')
// const linkFontColor = ref(propertyStore.linkFontColor || '#333')

const changeStrokeColor = (color: string | null) => {
  propertyStore.setLinkStrokeColor(color as string)
  strokeColor.value = color as string
}

const changeLinkWidth = (width: number) => {
  linkWidth.value = width
  propertyStore.setLinkWidth(width)
}

const changeLinkStrokeType = (type: string) => {
  propertyStore.setLinkStrokeType(type)
}
const changeLinkFontColor = (color: string | null) => {
  propertyStore.setLinkFontColor(color as string)
  linkFontColor.value = color as string
}

const changeLinkFontStyle = (style: string) => {
  if (style === 'fontWeight') {
    propertyStore.setLinkFontWeight()
  } else {
    propertyStore.setLinkFontItalic()
  }
}

const changeLinkText = (text: string) => {
  propertyStore.setLinkText(text)
}

const changeLinkFontSize = (size: number | undefined) => {
  propertyStore.setLinkFontSize(size as number)
}

const changeShapeLinkType = (type: string) => {
  propertyStore.changeShapeLinkType(type)
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
          @click="() => changeStrokeColor(color)"
        />
        <el-divider style="margin: 0 4px; height: 20px" direction="vertical" />
        <el-color-picker v-model="strokeColor" @change="changeStrokeColor" />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">线条宽度</div>
      <div class="property-value">
        <el-select
          v-model="linkWidth"
          size="small"
          style="width: 157px; margin-right: 5px"
          @change="changeLinkWidth"
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
          v-model="linkStrokeType"
          size="small"
          style="width: 157px; margin-right: 5px"
          @change="changeLinkStrokeType"
        >
          <el-option
            v-for="item in lineTypeOpt"
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
          v-model="shapeLinkType"
          size="small"
          style="width: 157px; margin-right: 5px"
          @change="changeShapeLinkType"
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
        <el-color-picker v-model="linkFontColor" @change="changeLinkFontColor" />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文本内容</div>
      <div class="property-value">
        <el-input
          v-model="linkFontText"
          :min="12"
          :max="30"
          size="small"
          :step="1"
          @input="changeLinkText"
          style="width: 157px; margin-right: 5px"
        />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文字大小</div>
      <div class="property-value">
        <el-input-number
          v-model="linkFontSize"
          :min="12"
          :max="30"
          size="small"
          :step="1"
          @change="changeLinkFontSize"
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
          @click="() => changeLinkFontStyle(style.name)"
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
