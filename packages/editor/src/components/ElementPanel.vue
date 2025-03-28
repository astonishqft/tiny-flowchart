<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  ElDialog,
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  FormInstance,
  ElCollapse,
  ElCollapseItem
} from 'element-plus'
import IconSquare from './icons/Square.vue'
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

const elementList = [
  {
    title: '基本图形',
    key: '0',
    elements: [
      {
        component: IconSquare,
        nodeType: 'square'
      },
      {
        component: IconRect,
        nodeType: 'rect'
      },
      {
        component: IconCircle,
        nodeType: 'circle'
      },
      {
        component: IconDiamond, // 菱形
        nodeType: 'diamond'
      },
      {
        component: IconText,
        nodeType: 'text'
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
        component: IconEllipse,
        nodeType: 'ellipse'
      },
      {
        component: IconParallelogram,
        nodeType: 'parallelogram'
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
        component: IconTriangle,
        nodeType: 'triangle'
      }
    ]
  },
  {
    title: '箭头',
    key: '1',
    elements: [
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
      }
    ]
  },
  {
    title: '符号',
    key: '2',
    elements: [
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
  }
]

const elementCategory = ref(['0'])
</script>

<template>
  <div class="element-panel">
    <el-collapse v-model="elementCategory">
      <el-collapse-item :name="item.key" v-for="item in elementList" :key="item.key">
        <template #title>
          <div class="element-title">{{ item.title }}</div>
        </template>
        <ul class="element-category">
          <li
            v-for="element in item.elements"
            :key="element.nodeType"
            :draggable="true"
            @dragstart="dragStart($event, { nodeType: element.nodeType })"
            class="element-item"
          >
            <component :is="element.component" class="svg-node" />
          </li>
        </ul>
      </el-collapse-item>
      <el-collapse-item name="自定义图片">
        <template #title>
          <div class="element-title">自定义图片</div>
        </template>
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
      </el-collapse-item>
    </el-collapse>

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

<style lang="less">
.element-panel {
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  li {
    display: inline-block;
    margin: 0 4px;
  }
  .element-title {
    margin-left: 10px;
    font-weight: 800;
  }
  position: absolute;
  left: 0;
  width: 185px;
  height: calc(100% - 40px);
  border-right: 1px solid #dadce0;
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
