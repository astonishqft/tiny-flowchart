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
import IconRect from './icons/Rect.vue'
import IconCircle from './icons/Circle.vue'
import IconDiamond from './icons/Diamond.vue'
import IconHeptagon from './icons/Heptagon.vue'
import IconHexagon from './icons/Hexagon.vue'
import IconParallelogram from './icons/Parallelogram.vue'
import IconPentagon from './icons/Pentagon.vue'
import IconText from './icons/Text.vue'
import IconTrapezoid from './icons/Trapezoid.vue'
import IconTriangle from './icons/Triangle.vue'
import IconSeptagon from './icons/Septagon.vue'
import IconArrowRight from './icons/ArrowRight.vue'
import IconArrowLeft from './icons/ArrowLeft.vue'
import IconArrowTop from './icons/ArrowTop.vue'
import IconArrowBottom from './icons/ArrowBottom.vue'
import IconTerminator from './icons/Terminator.vue'
import IconProcess from './icons/Process.vue'
import IconDocument from './icons/Document.vue'
import IconMultiDocument from './icons/MultiDocument.vue'
import IconDelay from './icons/Delay.vue'
import IconProcessBar from './icons/ProcessBar.vue'
import IconCard from './icons/Card.vue'
import IconCylinder from './icons/Cylinder.vue'
import IconPreparation from './icons/Preparation.vue'
import IconLoop from './icons/Loop.vue'
import IconPerhaps from './icons/Perhaps.vue'
import IconCollate from './icons/Collate.vue'
import IconSort from './icons/Sort.vue'
import IconDisplay from './icons/Display.vue'
import IconStore from './icons/Store.vue'
import IconManualInput from './icons/ManualInput.vue'
import IconPaperTape from './icons/PaperTape.vue'
import IconSequentialData from './icons/SequentialData.vue'
import IconManualOperation from './icons/ManualOperation.vue'
import IconDirectData from './icons/DirectData.vue'
import IconStoreData from './icons/StoreData.vue'
import IconParallelMode from './icons/ParallelMode.vue'
import IconAnnotation from './icons/Annotation.vue'
import IconInduce from './icons/Induce.vue'

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
    title: '基础图形',
    key: '0',
    elements: [
      {
        component: IconText,
        nodeType: 'text',
        title: '文本'
      },
      {
        component: IconSquare,
        nodeType: 'square',
        title: '正方形'
      },
      {
        component: IconRect,
        nodeType: 'rect',
        title: '矩形'
      },
      {
        component: IconCircle,
        nodeType: 'circle',
        title: '圆形'
      },
      {
        component: IconDiamond,
        nodeType: 'diamond',
        title: '菱形'
      },
      {
        component: IconTriangle,
        nodeType: 'triangle',
        title: '三角形'
      },
      {
        component: IconParallelogram,
        nodeType: 'parallelogram',
        title: '平行四边形'
      },
      {
        component: IconPentagon,
        nodeType: 'pentagon',
        title: '五边形'
      },
      {
        component: IconHexagon,
        nodeType: 'hexagon',
        title: '六边形'
      },
      {
        component: IconSeptagon,
        nodeType: 'septagon',
        title: '七边形'
      },
      {
        component: IconHeptagon,
        nodeType: 'heptagon',
        title: '八边形'
      },
      {
        component: IconTrapezoid,
        nodeType: 'trapezoid',
        title: '梯形'
      }
    ]
  },
  {
    title: 'Flowchart流程图',
    key: '1',
    elements: [
      {
        component: IconRect,
        nodeType: 'rectangle',
        title: '处理'
      },
      {
        component: IconCircle,
        nodeType: 'circle',
        title: '圆形'
      },
      {
        component: IconText,
        nodeType: 'text',
        title: '文本'
      },
      {
        component: IconDiamond,
        nodeType: 'diamond',
        title: '条件判断'
      },
      {
        component: IconParallelogram,
        nodeType: 'parallelogram',
        title: '数据输入输出'
      },
      {
        component: IconArrowRight,
        nodeType: 'arrowRight',
        title: '右箭头'
      },
      {
        component: IconArrowLeft,
        nodeType: 'arrowLeft',
        title: '左箭头'
      },
      {
        component: IconArrowTop,
        nodeType: 'arrowTop',
        title: '上箭头'
      },
      {
        component: IconArrowBottom,
        nodeType: 'arrowBottom',
        title: '下箭头'
      },
      {
        component: IconTerminator,
        nodeType: 'roundRect',
        title: '起止端点'
      },
      {
        component: IconProcess,
        nodeType: 'preRect',
        title: '预设处理'
      },
      {
        component: IconDocument,
        nodeType: 'document',
        title: '文件'
      },
      {
        component: IconMultiDocument,
        nodeType: 'multiDocument',
        title: '多文件'
      },
      {
        component: IconProcessBar,
        nodeType: 'processBar',
        title: '流程条'
      },
      {
        component: IconDelay,
        nodeType: 'delay',
        title: '延迟'
      },
      {
        component: IconCard,
        nodeType: 'card',
        title: '卡片'
      },
      {
        component: IconCylinder,
        nodeType: 'cylinder',
        title: '数据库'
      },
      {
        component: IconPreparation,
        nodeType: 'preparation',
        title: '准备'
      },
      {
        component: IconLoop,
        nodeType: 'loop',
        title: '循环边界'
      },
      {
        component: IconPerhaps,
        nodeType: 'perhaps',
        title: '求和函数'
      },
      {
        component: IconCollate,
        nodeType: 'collate',
        title: '合并'
      },
      {
        component: IconSort,
        nodeType: 'sort',
        title: '排序'
      },
      {
        component: IconDisplay,
        nodeType: 'display',
        title: '显示'
      },
      {
        component: IconStore,
        nodeType: 'store',
        title: '内部存储'
      },
      {
        component: IconManualInput,
        nodeType: 'manualInput',
        title: '手动输入'
      },
      {
        component: IconPaperTape,
        nodeType: 'paperTape',
        title: '纸带'
      },
      {
        component: IconSequentialData,
        nodeType: 'sequentialData',
        title: '序列数据'
      },
      {
        component: IconManualOperation,
        nodeType: 'manualOperation',
        title: '手动操作'
      },
      {
        component: IconDirectData,
        nodeType: 'directData',
        title: '直接数据'
      },
      {
        component: IconStoreData,
        nodeType: 'storeData',
        title: '存储数据'
      },
      {
        component: IconParallelMode,
        nodeType: 'parallelMode',
        title: '并行模式'
      },
      {
        component: IconAnnotation,
        nodeType: 'annotation',
        title: '注释'
      },
      {
        component: IconInduce,
        nodeType: 'induce',
        title: '引导'
      }
    ]
  }
]

const elementCategory = ref(['0', '1', '2'])
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
            :title="element.title"
            @dragstart="dragStart($event, { nodeType: element.nodeType })"
            class="element-item"
          >
            <component :is="element.component" class="svg-node" />
          </li>
        </ul>
      </el-collapse-item>
      <el-collapse-item name="2">
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
          <el-button type="primary" @click="submitForm(ruleFormRef)">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="less">
.element-panel {
  overflow-y: scroll;
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
