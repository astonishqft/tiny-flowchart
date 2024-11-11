<script setup lang="ts">
import { ref } from 'vue'
import { ElInputNumber, ElSwitch } from 'element-plus'

import { IocEditor } from '@ioceditor/core'

const props = defineProps<{
  iocEditor: IocEditor
}>()

const showGrid = ref(true)
const gridStep = ref(props.iocEditor._settingMgr.get('gridStep'))

const changeShowGrid = (isShow: boolean | string | number) => {
  showGrid.value = isShow as boolean
  props.iocEditor._settingMgr.set('showGrid', showGrid.value)
  if (isShow) {
    props.iocEditor._gridMgr.showGrid()
  } else {
    props.iocEditor._gridMgr.hideGrid()
  }
}

const changeGridStep = (step: number | undefined) => {
  if (step) {
    props.iocEditor._settingMgr.set('gridStep', step)
    props.iocEditor._gridMgr.drawGrid()
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
