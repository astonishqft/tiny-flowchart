export interface ITextPosition {
  name: string
  icon: string
  desc: string
}

export const bgColorList = ['transparent', '#ffc9c9', '#b2f2bb', '#a5d8ff', '#ffec99']
export const strokeColorList = ['#1e1e1e', '#e03131', '#2f9e44', '#1971c2', '#f08c00']

export const lineWidthOpts = [1, 2, 3, 4, 5]
export const lineTypeOpt = [
  {
    label: '实线',
    value: 'solid'
  },
  {
    label: '虚线',
    value: 'dashed'
  },
  {
    label: '点线',
    value: 'dotted'
  }
]

export const textPositionList: ITextPosition[] = [
  {
    name: 'inside',
    icon: 'icon-sInLineVertical',
    desc: '内置'
  },
  {
    name: 'top',
    icon: 'icon-LineUp',
    desc: '置顶'
  },
  {
    name: 'right',
    icon: 'icon-LineRight',
    desc: '置右'
  },
  {
    name: 'bottom',
    icon: 'icon-LineDown',
    desc: '置底'
  },
  {
    name: 'left',
    icon: 'icon-LineLeft',
    desc: '置左'
  }
]
