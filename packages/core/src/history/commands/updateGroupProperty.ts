import type { IExportShapeStyle, INodeGroup, ICommand, ITinyFlowchart } from '@/index'

export interface IUpdateGroupPropertyCommandOpts {
  group: INodeGroup
  groupConfig: IExportShapeStyle
  oldGroupConfig: IExportShapeStyle
}

class UpdateGroupPropertyCommand implements ICommand {
  private tinyFlowchart: ITinyFlowchart
  private group: INodeGroup
  private groupConfig: IExportShapeStyle
  private oldGroupConfig: IExportShapeStyle
  constructor(
    tinyFlowchart: ITinyFlowchart,
    group: INodeGroup,
    groupConfig: IExportShapeStyle,
    oldGroupConfig: IExportShapeStyle
  ) {
    this.tinyFlowchart = tinyFlowchart
    this.group = group
    this.groupConfig = groupConfig
    this.oldGroupConfig = oldGroupConfig
  }

  execute() {
    this.group.setStyle(this.groupConfig)
  }
  undo() {
    this.group.setStyle(this.oldGroupConfig)
  }

  redo() {
    this.execute()
  }
}

export { UpdateGroupPropertyCommand }
