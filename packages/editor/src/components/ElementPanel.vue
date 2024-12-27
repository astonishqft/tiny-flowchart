<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElDialog, ElButton, ElForm, ElFormItem, ElInput, FormInstance } from 'element-plus'
import IconActor from './icons/Actor.vue'
import IconCircle from './icons/Circle.vue'
import IconCross from './icons/Cross.vue'
import IconCylinde from './icons/Cylinde.vue'
import IconDiamond from './icons/Diamond.vue'
import IconDivide from './icons/Divide.vue'
import IconDownArrow from './icons/DownArrow.vue'
import IconEllipse from './icons/Ellipse.vue'
import IconHeptagon from './icons/Heptagon.vue'
import IconHexagon from './icons/Hexagon.vue'
import IconHorizontalArrow from './icons/HorizontalArrow.vue'
import IconLeftArrow from './icons/LeftArrow.vue'
import IconMinus from './icons/Minus.vue'
import IconParallelogram from './icons/Parallelogram.vue'
import IconPentagon from './icons/Pentagon.vue'
import IconRect from './icons/Rect.vue'
import IconRectRadius from './icons/RectRadius.vue'
import IconRightArrow from './icons/RightArrow.vue'
import IconText from './icons/Text.vue'
import IconTrapezoid from './icons/Trapezoid.vue'
import IconTriangle from './icons/Triangle.vue'
import IconUpArrow from './icons/UpArrow.vue'
import IconVerticalArrow from './icons/VerticalArrow.vue'
import IconSeptagon from './icons/Septagon.vue'
import IconTimes from './icons/Times.vue'

import type { Component } from 'vue'
import type { FormRules } from 'element-plus'

export interface ElementItemType {
  component: Component
  nodeType: string
}

interface RuleForm {
  url: string
}

const imageList = ref<string[]>([])

onMounted(() => {
  const imgs = localStorage.getItem('iocCustomImgs')
  if (imgs) {
    imageList.value = JSON.parse(imgs)
  }
})

const addImage = (url: string) => {
  imageList.value.push(url)
  localStorage.setItem('iocCustomImgs', JSON.stringify(imageList.value))
}

const elementList = [
  {
    component: IconCircle,
    nodeType: 'circle'
  },
  {
    component: IconRect,
    nodeType: 'rect'
  },
  {
    component: IconRectRadius,
    nodeType: 'rectRadius'
  },
  {
    component: IconActor,
    nodeType: 'actor'
  },
  {
    component: IconCylinde,
    nodeType: 'cylinde'
  },
  {
    component: IconDiamond,
    nodeType: 'diamond'
  },
  {
    component: IconEllipse,
    nodeType: 'ellipse'
  },
  {
    component: IconParallelogram,
    nodeType: 'parallelogram'
  },
  {
    component: IconText,
    nodeType: 'text'
  },
  {
    component: IconTriangle,
    nodeType: 'triangle'
  },
  {
    component: IconLeftArrow,
    nodeType: 'leftArrow'
  },
  {
    component: IconRightArrow,
    nodeType: 'rightArrow'
  },
  {
    component: IconHorizontalArrow,
    nodeType: 'horizontalArrow'
  },
  {
    component: IconUpArrow,
    nodeType: 'upArrow'
  },
  {
    component: IconDownArrow,
    nodeType: 'downArrow'
  },
  {
    component: IconVerticalArrow,
    nodeType: 'verticalArrow'
  },
  {
    component: IconPentagon,
    nodeType: 'pentagon'
  },
  {
    component: IconHexagon,
    nodeType: 'hexagon'
  },
  {
    component: IconSeptagon,
    nodeType: 'septagon'
  },
  {
    component: IconHeptagon,
    nodeType: 'heptagon'
  },
  {
    component: IconTrapezoid,
    nodeType: 'trapezoid'
  },
  {
    component: IconCross,
    nodeType: 'cross'
  },
  {
    component: IconMinus,
    nodeType: 'minus'
  },
  {
    component: IconTimes,
    nodeType: 'times'
  },
  {
    component: IconDivide,
    nodeType: 'divide'
  }
]

const dragStart = (event: DragEvent, element: { nodeType: string; url?: string }) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('addShape', JSON.stringify(element))
  }
}

const ruleFormRef = ref<FormInstance>()
const showUploadImageDialog = ref(false)
const form = reactive<RuleForm>({
  url: ''
})

const rules = reactive<FormRules<RuleForm>>({
  url: [{ required: true, message: '请输入图片链接', trigger: 'blur' }]
})

const uploadImage = () => {
  showUploadImageDialog.value = true
}

const handleBeforeClose = (done: () => void) => {
  showUploadImageDialog.value = false
  if (!ruleFormRef.value) return
  form.url = ''
  ruleFormRef.value.resetFields()
  done()
}

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      addImage(form.url)
      ruleFormRef.value?.resetFields()
      showUploadImageDialog.value = false
    } else {
      console.log('error submit!', fields)
    }
  })
}
</script>

<template>
  <div class="element-panel">
    <h1 class="element-category-title">普通节点</h1>
    <ul class="element-category">
      <li
        v-for="element in elementList"
        :key="element.nodeType"
        :draggable="true"
        @dragstart="dragStart($event, { nodeType: element.nodeType })"
        class="element-item"
      >
        <component :is="element.component" class="svg-node" />
      </li>
    </ul>
    <h1 class="element-category-title">图片节点</h1>
    <div class="pic-preview-list">
      <div
        class="pic-preview-item"
        v-for="(item, index) in imageList"
        :key="`pre-pic-${index}`"
        @dragstart="dragStart($event, { nodeType: 'image', url: item })"
      >
        <img :src="item" alt="" />
      </div>
      <div
        class="pic-preview-item icon iconfont upload-image icon-a-tianjiashangchuantupian"
        :title="'上传图片'"
        @click="uploadImage"
      ></div>
    </div>

    <el-dialog
      :before-close="handleBeforeClose"
      v-model="showUploadImageDialog"
      title="上传图片"
      width="500"
    >
      <div>
        <el-form
          :model="form"
          :rules="rules"
          label-width="auto"
          style="max-width: 600px"
          ref="ruleFormRef"
        >
          <el-form-item label="图片连接" prop="url">
            <el-input v-model="form.url" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm(ruleFormRef)"> 确定 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="less">
ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
li {
  display: inline-block;
  margin: 0 4px;
}
.element-panel {
  position: absolute;
  left: 0;
  width: 185px;
  height: calc(100% - 40px);
  border-right: 1px solid #dadce0;
  .element-category {
    border-bottom: 1px solid #e5e5e5;
  }
  .element-item {
    padding-top: 2px;
    padding-left: 1px;
    width: 37px;
    height: 37px;
    &:hover {
      background: #e5e5e5;
      cursor: pointer;
    }
  }
  .svg-node {
    left: 1px;
    top: 1px;
    width: 32px;
    height: 30px;
    display: block;
    position: relative;
    overflow: hidden;
  }
  .element-category-title {
    display: block;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    font-size: 14px;
    border-bottom: 1px solid #e5e5e5;
    font-weight: bold;
  }
  .upload-image {
    width: 38px;
    height: 38px;
    font-size: 26px;
    &:hover {
      background-color: #eeeeee;
      color: #5cb6ff;
      cursor: pointer;
    }
  }
  .pic-preview-list {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    .pic-preview-item {
      flex: 0 0 33.33%;
      box-sizing: border-box;
      height: 40px;
      padding: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      &:hover {
        cursor: pointer;
      }
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
