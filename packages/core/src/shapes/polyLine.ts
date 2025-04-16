import { Path } from '@/index'

const PolyLine = Path.extend({
  type: 'custom-polyLine',
  shape: {
    points: []
  },
  style: {
    fill: 'none'
  },
  buildPath: (ctx: CanvasRenderingContext2D, shape: { points: number[][] }) => {
    const { points } = shape
    if (points && points.length >= 2) {
      ctx.moveTo(points[0][0], points[0][1])
      for (let i = 1, l = points.length; i < l; i++) {
        ctx.lineTo(points[i][0], points[i][1])
      }
    }
  }
})

export { PolyLine }
