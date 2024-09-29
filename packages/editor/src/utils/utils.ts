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
  if (lineDash[0] === 5 && lineDash[1] === 5) {
    strokeType = 'dashed'
  } else if (lineDash[0] === 2 && lineDash[1] === 2) {
    strokeType = 'dotted'
  }

  return strokeType
}
