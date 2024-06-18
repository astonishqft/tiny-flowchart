import { Subject } from 'rxjs'

export interface IDisposable {
  _disposables: Subject<any>[] 
  dispose(): void;
}

class Disposable implements IDisposable {
  _disposables: Subject<any>[] = []

  dispose(): void {
    this._disposables.forEach(disposable => {
      disposable.unsubscribe()
    })
  }
}

export { Disposable }
