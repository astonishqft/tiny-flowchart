<script setup lang="ts">
import { ref } from 'vue'
import { NodeType } from '@tiny-flowchart/core'
import { ElColorPicker, ElDivider, ElInput, ElInputNumber, ElOption, ElSelect } from 'element-plus'
import { bgColorList, strokeColorList, lineWidthOpts, lineTypeOpt } from './config'

import type { ITextPosition } from './config'
import type {
  BuiltinTextPosition,
  LineDashStyle,
  INodeGroup,
  IExportGroupStyle,
  ITinyFlowchart,
  INodeMouseDown
} from '@tiny-flowchart/core'

const { tinyFlowchart } = defineProps<{
  tinyFlowchart: ITinyFlowchart
}>()

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
  }
]

const activeGroup = ref()

const groupConfig = ref<IExportGroupStyle>({
  fill: '#fff',
  stroke: '#333',
  lineWidth: 1,
  lineDash: 'solid',
  fontColor: '#333',
  fontSize: 12,
  text: '',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textPosition: 'insideLeft'
})

tinyFlowchart._nodeEventMgr.updateNodeClick$.subscribe(({ node }: INodeMouseDown) => {
  if (node?.nodeType === NodeType.Group) {
    activeGroup.value = node as INodeGroup
    groupConfig.value.fill = activeGroup.value.groupRect?.style.fill as string
    groupConfig.value.stroke = activeGroup.value.groupRect?.style.stroke as string
    groupConfig.value.fontColor = activeGroup.value.groupHead?.getTextContent().style.fill || '#333'
    groupConfig.value.lineWidth = activeGroup.value.groupRect?.style.lineWidth || 1
    groupConfig.value.lineDash = activeGroup.value.groupRect?.style.lineDash || 'solid'
    groupConfig.value.text = activeGroup.value.groupHead?.getTextContent().style.text || ''
    groupConfig.value.fontSize = activeGroup.value.groupHead?.getTextContent().style
      .fontSize as number
    groupConfig.value.fontStyle =
      activeGroup.value.groupHead?.getTextContent().style.fontStyle || 'normal'
    groupConfig.value.fontWeight =
      activeGroup.value.groupHead?.getTextContent().style.fontWeight || 'normal'
    groupConfig.value.textPosition =
      activeGroup.value.groupHead?.textConfig?.position || 'insideLeft'
  }
})

const changeGroupBgColor = (color: string | null) => {
  const oldGroupConfig = { ...activeGroup.value!.getExportData().style }
  groupConfig.value.fill = color as string
  tinyFlowchart.execute('updateGroupProperty', {
    group: activeGroup.value as INodeGroup,
    groupConfig: { ...groupConfig.value },
    oldGroupConfig
  })
}

const changeGroupStrokeColor = (color: string | null) => {
  const oldGroupConfig = { ...activeGroup.value!.getExportData().style }
  groupConfig.value.stroke = color as string
  tinyFlowchart.execute('updateGroupProperty', {
    group: activeGroup.value as INodeGroup,
    groupConfig: { ...groupConfig.value },
    oldGroupConfig
  })
}

const changeGroupHeadFontColor = (color: string | null) => {
  const oldGroupConfig = { ...activeGroup.value!.getExportData().style }
  groupConfig.value.fontColor = color as string
  tinyFlowchart.execute('updateGroupProperty', {
    group: activeGroup.value as INodeGroup,
    groupConfig: { ...groupConfig.value },
    oldGroupConfig
  })
}

const changeGroupFontSize = (size: number | undefined) => {
  const oldGroupConfig = { ...activeGroup.value!.getExportData().style }
  groupConfig.value.fontSize = size
  tinyFlowchart.execute('updateGroupProperty', {
    group: activeGroup.value as INodeGroup,
    groupConfig: { ...groupConfig.value },
    oldGroupConfig
  })
}

const changeGroupLineWidth = (width: number) => {
  const oldGroupConfig = { ...activeGroup.value!.getExportData().style }
  groupConfig.value.lineWidth = width
  tinyFlowchart.execute('updateGroupProperty', {
    group: activeGroup.value as INodeGroup,
    groupConfig: { ...groupConfig.value },
    oldGroupConfig
  })
}

const changeGroupStrokeType = (type: string) => {
  const oldGroupConfig = { ...activeGroup.value!.getExportData().style }
  groupConfig.value.lineDash = type as LineDashStyle
  tinyFlowchart.execute('updateGroupProperty', {
    group: activeGroup.value as INodeGroup,
    groupConfig: { ...groupConfig.value },
    oldGroupConfig
  })
}

const changeGroupTextPosition = (position: BuiltinTextPosition) => {
  const oldGroupConfig = { ...activeGroup.value!.getExportData().style }
  groupConfig.value.textPosition = position
  tinyFlowchart.execute('updateGroupProperty', {
    group: activeGroup.value as INodeGroup,
    groupConfig: { ...groupConfig.value },
    oldGroupConfig
  })
}

const changeGroupFontStyle = (style: string) => {
  const oldGroupConfig = { ...activeGroup.value!.getExportData().style }
  const fWeight = activeGroup.value!.groupHead?.getTextContent().style.fontWeight || 'normal'
  const fStyle = activeGroup.value!.groupHead?.getTextContent().style.fontStyle || 'normal'
  if (style === 'fontWeight') {
    groupConfig.value.fontWeight = fWeight === 'normal' ? 'bold' : 'normal'
  } else {
    groupConfig.value.fontStyle = fStyle === 'normal' ? 'italic' : 'normal'
  }
  tinyFlowchart.execute('updateGroupProperty', {
    group: activeGroup.value as INodeGroup,
    groupConfig: { ...groupConfig.value },
    oldGroupConfig
  })
}

const changeGroupText = (text: string) => {
  const oldGroupConfig = { ...activeGroup.value!.getExportData().style }
  groupConfig.value.text = text
  tinyFlowchart.execute('updateGroupProperty', {
    group: activeGroup.value as INodeGroup,
    groupConfig: { ...groupConfig.value },
    oldGroupConfig
  })
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
        <el-color-picker
          v-model="groupConfig.fill as string"
          @change="changeGroupBgColor"
          size="small"
        />
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
        <el-color-picker
          v-model="groupConfig.stroke as string"
          @change="changeGroupStrokeColor"
          size="small"
        />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">边框宽度</div>
      <div class="property-value">
        <el-select v-model="groupConfig.lineWidth" size="small" @change="changeGroupLineWidth">
          <el-option v-for="item in lineWidthOpts" :key="item" :label="`${item}px`" :value="item" />
        </el-select>
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">边框类型</div>
      <div class="property-value">
        <el-select
          placeholder="Select"
          v-model="groupConfig.lineDash"
          size="small"
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
        <el-color-picker
          v-model="groupConfig.fontColor as string"
          @change="changeGroupHeadFontColor"
          size="small"
        />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文本内容</div>
      <div class="property-value">
        <el-input
          v-model="groupConfig.text"
          :min="12"
          :max="30"
          size="small"
          :step="1"
          @input="changeGroupText"
        />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文字大小</div>
      <div class="property-value">
        <el-input-number
          v-model="groupConfig.fontSize as number"
          :min="12"
          :max="30"
          size="small"
          :step="1"
          @change="changeGroupFontSize"
          style="width: 100%"
        />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">文字样式</div>
      <div class="property-value">
        <span
          class="icon iconfont font-style-icon icon-zitiyangshi_jiacu"
          :class="{ active: groupConfig.fontWeight === 'bold' }"
          :title="'加粗'"
          @click="() => changeGroupFontStyle('fontWeight')"
        />
        <span
          class="icon iconfont font-style-icon icon-zitiyangshi_xieti"
          :class="{ active: groupConfig.fontStyle === 'italic' }"
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
          :class="[position.icon, { active: groupConfig.textPosition === position.name }]"
          v-for="position in textPositionList"
          :key="position.name"
          :title="position.desc"
          @click="() => changeGroupTextPosition(position.name as BuiltinTextPosition)"
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
