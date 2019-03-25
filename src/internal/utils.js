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
export const isIterable = obj => typeof obj === 'object' && typeof obj[Symbol.iterator] === 'function';
/**
 * @ignore
 */
export const isObserver = obj => typeof obj === 'object' && typeof obj.onSubscribe === 'function';
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
  if (!(err instanceof Error)) {
    report = new Error('onError called with a non-Error value.');
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

  fire() {
    const { onDispose } = this;
    this.state = DISPOSED;
    if (typeof onDispose === 'function') {
      onDispose();
    }
    this.onDispose = undefined;
  }

  dispose() {
    const { state } = this;

    if (state === DISPOSED) {
      return;
    }

    if (isDisposable(state)) {
      if (!state.isDisposed()) {
        this.state.dispose();
      }
      if (state.isDisposed()) {
        this.fire();
      }
    } else {
      this.fire();
    }
  }

  isDisposed() {
    const { state } = this;
    if (isDisposable(state)) {
      if (state.isDisposed()) {
        this.fire();
        return true;
      }
      return false;
    }
    return state === DISPOSED;
  }
}

/**
 * @ignore
 */
export class CompositeDisposable {
  constructor() {
    this.set = [];
    this.disposed = false;
  }

  add(d) {
    if (isDisposable(d)) {
      if (this.disposed) {
        d.dispose();
      } else {
        this.set.push(d);
      }
    }
  }

  dispose() {
    if (!this.disposed) {
      // eslint-disable-next-line no-restricted-syntax
      for (const d of this.set) {
        d.dispose();
      }
      this.set = undefined;
      this.disposed = DISPOSED;
    }
  }

  isDisposed() {
    return this.disposed === DISPOSED;
  }
}
/**
 * @ignore
 */
const identity = x => x;
/**
 * @ignore
 */
const throwError = (x) => { throw x; };
/**
 * @ignore
 */
export const cleanObserver = x => ({
  onSubscribe: x.onSubscribe,
  onSuccess: typeof x.onSuccess === 'function' ? x.onSuccess : identity,
  onError: typeof x.onError === 'function' ? x.onError : throwError,
});
/**
 * @ignore
 */
export const immediateSuccess = (o, x) => {
  const disposable = new SimpleDisposable();
  o.onSubscribe(disposable);

  if (!disposable.isDisposed()) {
    o.onSuccess(x);
    disposable.dispose();
  }
};
/**
 * @ignore
 */
export const immediateError = (o, x) => {
  const { onSubscribe, onError } = cleanObserver(o);
  const disposable = new SimpleDisposable();
  onSubscribe(disposable);

  if (!disposable.isDisposed()) {
    onError(x);
    disposable.dispose();
  }
};
