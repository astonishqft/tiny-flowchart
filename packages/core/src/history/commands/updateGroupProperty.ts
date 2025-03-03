import type { IExportShapeStyle, INodeGroup, ICommand, IIocEditor } from '@/index'

export interface IUpdateGroupPropertyCommandOpts {
  group: INodeGroup
  groupConfig: IExportShapeStyle
  oldGroupConfig: IExportShapeStyle
}

class UpdateGroupPropertyCommand implements ICommand {
  private iocEditor: IIocEditor
  private group: INodeGroup
  private groupConfig: IExportShapeStyle
  private oldGroupConfig: IExportShapeStyle
  constructor(
    iocEditor: IIocEditor,
    group: INodeGroup,
    groupConfig: IExportShapeStyle,
    oldGroupConfig: IExportShapeStyle
  ) {
    this.iocEditor = iocEditor
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
