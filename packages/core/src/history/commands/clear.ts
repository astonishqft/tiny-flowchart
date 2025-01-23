import { type IExportData } from '../../shapes'

import type { Command } from '../historyManage'
import type { IIocEditor } from '../../iocEditor'

export interface IClearCommandOpts {
  exportData: IExportData
}

class ClearCommand implements Command {
  private iocEditor: IIocEditor
  private exportData: IExportData
  constructor(iocEditor: IIocEditor, exportData: IExportData) {
    this.iocEditor = iocEditor
    this.exportData = exportData
  }
  execute() {
    this.iocEditor._sceneMgr.clear()
  }
  undo() {
    this.iocEditor.initFlowChart(this.exportData)
  }

  redo() {
    this.execute()
  }
}

export { ClearCommand }
