/**
 * @ignore
 */
export const DISPOSED = Symbol('DISPOSED');
/**
 * @ignore
 */
export const isDisposable = obj => typeof obj === 'object' && (typeof obj.dispose === 'function' || typeof obj.isDisposed === 'function');
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
  if (this.state === DISPOSED) {
    return;
  }
  const d = this.state;
  this.state = DISPOSED;

  try {
    if (typeof value === 'undefined') {
      this.onError('onSuccess called with undefined.');
    } else {
      this.onSuccess(value);
    }
  } finally {
    if (isDisposable(d)) {
      d.dispose();
    }
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
  if (this.state === DISPOSED) {
    return;
  }

  const d = this.state;
  this.state = DISPOSED;
  try {
    this.onError(report);
  } finally {
    if (isDisposable(d)) {
      d.dispose();
    }
  }
}

export class SimpleDisposable {
  constructor() {
    this.state = false;
  }

  dispose() {
    this.state = DISPOSED;
  }

  isDisposed() {
    return this.state === DISPOSED;
  }
}
