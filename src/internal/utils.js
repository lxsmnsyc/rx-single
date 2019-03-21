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
    const { state, onDispose } = this;

    if (isDisposable(state)) {
      state.dispose();
    }
    if (typeof onDispose === 'function') {
      onDispose();
    }
    this.state = DISPOSED;
  }

  isDisposed() {
    const { state } = this;
    if (isDisposable(state)) {
      if (state.isDisposed()) {
        this.state = DISPOSED;
        return true;
      }
      return false;
    }
    return this.state === DISPOSED;
  }
}
