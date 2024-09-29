import { Rectangle } from './helpers/Rectangle'

class Grid {
  private _rows = 0
  private _cols = 0
  readonly data: Map<number, Map<number, Rectangle>> = new Map()

  constructor() { }

  set(row: number, column: number, rectangle: Rectangle) {
    this._rows = Math.max(this.rows, row + 1)
    this._cols = Math.max(this.columns, column + 1)
    const rowMap: Map<number, Rectangle> = this.data.get(row) || this.data.set(row, new Map()).get(row)!
    rowMap.set(column, rectangle)
  }

  get(row: number, column: number): Rectangle | null {
    const rowMap = this.data.get(row)
    if (rowMap) {
      return rowMap.get(column) || null
    }

    return null
  }

  rectangles(): Rectangle[] {
    const r: Rectangle[] = []

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, data] of this.data) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const [_, rect] of data) {
        r.push(rect)
      }
    }

    return r
  }

  get columns(): number {
    return this._cols
  }

  get rows(): number {
    return this._rows
  }
}

export default Grid
