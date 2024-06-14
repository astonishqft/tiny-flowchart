<script setup lang="ts">
import type { Component } from 'vue'
import IconCircle from './icons/Circle.vue'
import IconRect from './icons/Rect.vue'
import IconRectRadius from './icons/RectRadius.vue'
import IconActor from './icons/Actor.vue'
import IconCylinde from './icons/Cylinde.vue'
import IconDiamond from './icons/Diamond.vue'
import IconEllipse from './icons/Ellipse.vue'
import IconParallelogram from './icons/Parallelogram.vue'
import IconText from './icons/Text.vue'
import IconTriangle from './icons/Triangle.vue'
import IconLeftArrow from './icons/LeftArrow.vue'
import IconRightArrow from './icons/RightArrow.vue'
import IconHorizontalArrow from './icons/HorizontalArrow.vue'
import IconUpArrow from './icons/UpArrow.vue'
import IconDownArrow from './icons/DownArrow.vue'
import IconVerticalArrow from './icons/VerticalArrow.vue'
import IconPentagon from './icons/Pentagon.vue'
import IconHexagon from './icons/Hexagon.vue'
import IconSeptagon from './icons/Septagon.vue'
import IconHeptagon from './icons/Heptagon.vue'
import IconTrapezoid from './icons/Trapezoid.vue'
import IconCross from './icons/Cross.vue'
import IconMinus from './icons/Minus.vue'
import IconTimes from './icons/Times.vue'
import IconDivide from './icons/Divide.vue'

export interface ElementItemType {
  component: Component
  nodeType: string
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

const dragStart = (event: DragEvent, element: ElementItemType) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('addShape', JSON.stringify(element))
  }
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
        @dragstart="dragStart($event, element)"
        class="element-item"
      >
        <component :is="element.component" class="svg-node" />
      </li>
    </ul>
    <h1 class="element-category-title">图片节点</h1>
    <span
      class="icon iconfont upload-image icon-a-tianjiashangchuantupian"
      :title="'上传图片'"
    ></span>
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
    margin-left: 10px;
    &:hover {
      background-color: #eeeeee;
      color: #5cb6ff;
      cursor: pointer;
    }
  }
}
</style>
