import { getBoundingBox } from '@/utils'
import { Path, PathProps } from '@/index'

import type { IAnchor } from '@/index'

export class IAnnotationShape {
  x = 0
  y = 0
  width = 0
  height = 0
}

const CustomAnnotation = Path.extend({
  type: 'custom-annotation',
  shape: {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  },
  buildPath: function (ctx, shape) {
    const { x, y, width, height } = shape
    ctx.moveTo(x + width, y)
    ctx.lineTo(x, y)
    ctx.lineTo(x, y + height)
    ctx.lineTo(x + width, y + height)

    return
  }
})

class Annotation extends CustomAnnotation {
  anchors: IAnchor[] = []
  constructor(data: PathProps & { shape: IAnnotationShape }) {
    super(data)
    this.createAnchors()
  }
  createAnchors() {
    const { x, y, width, height } = getBoundingBox([this])

    this.anchors = [
      { x: x + width / 4, y: y, index: 1, direct: 'top' },
      { x: x + width / 2, y: y, index: 2, direct: 'top' },
      { x: x + (width * 3) / 4, y: y, index: 3, direct: 'top' },
      { x: x + width / 4, y: y + height, index: 4, direct: 'bottom' },
      { x: x + width / 2, y: y + height, index: 5, direct: 'bottom' },
      { x: x + (width * 3) / 4, y: y + height, index: 6, direct: 'bottom' },
      { x: x, y: y + height / 4, index: 7, direct: 'left' },
      { x: x, y: y + height / 2, index: 8, direct: 'left' },
      { x: x, y: y + (height * 3) / 4, index: 9, direct: 'left' }
    ]
  }
}

export { Annotation }
