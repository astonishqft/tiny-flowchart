import * as zrender from 'zrender'

export interface IShape extends zrender.Element {
  oldX?: number;
  oldY?: number;
  selected: boolean;
  nodeType: string;
  createAnchors(): void;
  active(): void;
  unActive(): void;
}
