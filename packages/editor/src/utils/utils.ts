export const convertStrokeTypeToLineDash = (type: string): number[] => {
  let lineDash = [0, 0]
  switch (type) {
    case 'solid':
      lineDash = [0, 0]
      break
    case 'dashed':
      lineDash = [5, 5]
      break
    case 'dotted':
      lineDash = [2, 2]
      break
    default:
      break
  }

  return lineDash
}

export const convertLineDashToStrokeType = (lineDash: number[]): string => {
  let strokeType = 'solid'
  switch (lineDash) {
    case [0, 0]:
      strokeType = 'solid'
      break
    case [5, 5]:
      strokeType = 'dashed'
      break
    case [2, 2]:
      strokeType = 'dotted'
      break
    default:
      break
  }

  return strokeType
}
