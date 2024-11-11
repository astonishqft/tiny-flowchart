export interface Rect {
  x: number
  y: number
  width: number
  height: number
}
export type BasicCardinalPoint = 'n' | 'e' | 's' | 'w'
export interface IPoint {
  x: number
  y: number
}
export interface Size {
  width: number
  height: number
}
export function makePt(x: number, y: number): IPoint {
  return { x, y }
}
export function distance(a: IPoint, b: IPoint): number {
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
}
export class Rectangle {
  x: number
  y: number
  width: number
  height: number

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  static fromRect(rect: Rect) {
    return new Rectangle(rect.x, rect.y, rect.width, rect.height)
  }

  static fromLTRB(left: number, top: number, right: number, bottom: number) {
    return new Rectangle(left, top, right - left, bottom - top)
  }

  inflate(horizontal: number, vertical: number) {
    return Rectangle.fromLTRB(
      this.left - horizontal,
      this.top - vertical,
      this.right + horizontal,
      this.bottom + vertical
    )
  }

  intersects(rectangle: Rectangle): boolean {
    const thisX = this.left
    const thisY = this.top
    const thisW = this.width
    const thisH = this.height
    const rectX = rectangle.left
    const rectY = rectangle.top
    const rectW = rectangle.width
    const rectH = rectangle.height

    return (
      rectX <= thisX + thisW &&
      thisX <= rectX + rectW &&
      rectY <= thisY + thisH &&
      thisY <= rectY + rectH
    )
  }

  // 判断某个点是否在矩形内
  contains(p: IPoint): boolean {
    return p.x >= this.left && p.x <= this.right && p.y >= this.top && p.y <= this.bottom
  }

  union(rectangle: Rectangle): Rectangle {
    const x = [this.left, this.right, rectangle.left, rectangle.right]
    const y = [this.top, this.bottom, rectangle.top, rectangle.bottom]

    return Rectangle.fromLTRB(Math.min(...x), Math.min(...y), Math.max(...x), Math.max(...y))
  }

  get center(): IPoint {
    return {
      x: this.left + this.width / 2,
      y: this.top + this.height / 2
    }
  }

  get left() {
    return this.x
  }

  get top() {
    return this.y
  }

  get right() {
    return this.x + this.width
  }

  get bottom() {
    return this.y + this.height
  }

  get northEast(): IPoint {
    return { x: this.right, y: this.top }
  }

  get southEast(): IPoint {
    return { x: this.right, y: this.bottom }
  }

  get southWest(): IPoint {
    return { x: this.left, y: this.bottom }
  }

  get northWest(): IPoint {
    return { x: this.left, y: this.top }
  }

  get east(): IPoint {
    return makePt(this.right, this.center.y)
  }

  get north(): IPoint {
    return makePt(this.center.x, this.top)
  }

  get south(): IPoint {
    return makePt(this.center.x, this.bottom)
  }

  get west(): IPoint {
    return makePt(this.left, this.center.y)
  }

  get size(): Size {
    return { width: this.width, height: this.height }
  }
}
