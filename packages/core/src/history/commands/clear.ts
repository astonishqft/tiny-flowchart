import type { IExportData, ICommand, ITinyFlowchart } from '@/index'

export interface IClearCommandOpts {
  exportData: IExportData
}

class ClearCommand implements ICommand {
  private tinyFlowchart: ITinyFlowchart
  private exportData: IExportData
  constructor(tinyFlowchart: ITinyFlowchart, exportData: IExportData) {
    this.tinyFlowchart = tinyFlowchart
    this.exportData = exportData
  }

  execute() {
    this.tinyFlowchart._sceneMgr.clear()
  }

  undo() {
    this.tinyFlowchart.initFlowChart(this.exportData)
  }

  redo() {
    this.execute()
  }
}

export { ClearCommand }
