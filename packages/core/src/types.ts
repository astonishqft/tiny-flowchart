import * as zrender from 'zrender'

export type Constructor<T = {}> = new (...args: any[]) => T

export type SafeDisplayable = Omit<
  zrender.Displayable,
  '_$eventProcessor' | 'getOutsideFill' | '_normalState'
>

export type Dictionary<T> = {
  [key: string]: T
}

export interface ISceneDragStartOpts {
  startX: number
  startY: number
  oldViewPortX: number
  oldViewPortY: number
}

export interface ISceneDragMoveOpts {
  x: number
  y: number
  offsetX: number
  offsetY: number
}

export interface IUpdateZoomOpts {
  zoom: number
}
