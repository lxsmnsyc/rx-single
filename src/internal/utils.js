/**
 * @ignore
 */
export const DISPOSED = Symbol('DISPOSED');
/**
 * @ignore
 */
export const isDisposable = obj => typeof obj === 'object' && (typeof obj.dispose === 'function' && typeof obj.isDisposed === 'function');
/**
 * @ignore
 */
export const disposed = {
  dispose: () => {},
  isDisposed: () => true,
};
/**
 * @ignore
 */
export const neverDisposed = {
  dispose: () => {},
  isDisposed: () => false,
};
/**
 * @ignore
 */
export const toCallable = x => () => x;
/**
 * @ignore
 */
export const isPromise = obj => (obj instanceof Promise) || (!!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function');
/**
 * @ignore
 */
export function onSuccessHandler(value) {
  if (this.disposable.isDisposed()) {
    return;
  }
  try {
    if (typeof value === 'undefined') {
      this.onError('onSuccess called with undefined.');
    } else {
      this.onSuccess(value);
    }
  } finally {
    this.disposable.dispose();
  }
}
/**
 * @ignore
 */
export function onErrorHandler(err) {
  let report = err;
  if (typeof err === 'undefined') {
    report = 'onError called with undefined value.';
  }
  if (this.disposable.isDisposed()) {
    return;
  }

  try {
    this.onError(report);
  } finally {
    this.disposable.dispose();
  }
}
/**
 * @ignore
 */
export class SimpleDisposable {
  constructor(onDispose) {
    this.state = false;
    this.onDispose = onDispose;
  }

  setDisposable(disposable) {
    if (isDisposable(disposable)) {
      if (this.state === DISPOSED) {
        disposable.dispose();
      } else {
        this.state = disposable;
      }
    }
  }

  dispose() {
    if (isDisposable(this.state)) {
      this.state.dispose();
    }
    if (typeof this.onDispose === 'function') {
      this.onDispose();
    }
    this.state = DISPOSED;
  }

  isDisposed() {
    if (isDisposable(this.state)) {
      return this.state.isDisposed();
    }
    return this.state === DISPOSED;
  }
}
