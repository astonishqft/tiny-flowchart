<script setup lang="ts">
import { ref, inject } from 'vue'
import { Container } from 'inversify'
import { ElSwitch, ElInputNumber } from 'element-plus'
import { IDENTIFIER } from '@ioceditor/core'

import type { ISettingManage, IGridManage } from '@ioceditor/core'

const iocEditor = inject<Container>('iocEditor') as Container
const gridMgr = iocEditor.get<IGridManage>(IDENTIFIER.GRID_MANAGE)
const settingMgr = iocEditor.get<ISettingManage>(IDENTIFIER.SETTING_MANAGE)
const showGrid = ref(true)
const gridStep = ref(settingMgr.get('gridStep'))

const changeShowGrid = (isShow: boolean | string | number) => {
  showGrid.value = isShow as boolean
  settingMgr.set('showGrid', showGrid.value)
  if (isShow) {
    gridMgr.showGrid()
  } else {
    gridMgr.hideGrid()
  }
}

const changeGridStep = (step: number | undefined) => {
  if (step) {
    settingMgr.set('gridStep', step)
    gridMgr.drawGrid()
  }
}
</script>
<template>
  <div class="scene-property">
    <div class="property-item">
      <div class="property-name">是否显示网格线</div>
      <div class="property-value">
        <el-switch v-model="showGrid" @change="changeShowGrid" />
      </div>
    </div>
    <div class="property-item">
      <div class="property-name">网格间距</div>
      <div class="property-value">
        <el-input-number
          v-model="gridStep"
          :min="12"
          :max="30"
          size="small"
          :step="1"
          @change="changeGridStep"
          style="width: 157px; margin-right: 5px"
        />
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.scene-property {
  padding: 15px;
  .property-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    .property-name {
      font-size: 12px;
    }
    .property-value {
      margin-left: 15px;
    }
  }
}
</style>
