import { Image as ZImage } from '@/index'
import { getBoundingBox } from '@/utils'

import type { RectProps, IAnchor } from '@/index'

class Image extends ZImage {
  anchors: IAnchor[] = []

  constructor(data: RectProps) {
    super(data)
    this.createAnchors()
  }

  createAnchors() {
    this.anchors = []
    const box = getBoundingBox([this])

    // 定义锚点位置
    this.anchors = [
      { x: box.x + box.width / 2, y: box.y, index: 1, direct: 'top' },
      { x: box.x + box.width, y: box.y + box.height / 2, index: 2, direct: 'right' },
      { x: box.x + box.width / 2, y: box.y + box.height, index: 3, direct: 'bottom' },
      { x: box.x, y: box.y + box.height / 2, index: 4, direct: 'left' }
    ]
  }
}

export { Image }
