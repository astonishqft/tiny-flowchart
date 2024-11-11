import * as zrender from 'zrender'

export type Constructor<T = {}> = new (...args: any[]) => T

export type SafeDisplayable = Omit<
  zrender.Displayable,
  '_$eventProcessor' | 'getOutsideFill' | '_normalState'
>

export type Dictionary<T> = {
  [key: string]: T
}
