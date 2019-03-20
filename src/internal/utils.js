export const DISPOSED = Symbol('DISPOSED');

export const isDisposable = obj => typeof obj === 'object' && (typeof obj.dispose === 'function' || typeof obj.isDisposed === 'function');

export const disposed = {
  dispose: () => {},
  isDisposed: () => true,
};

export const toCallable = x => () => x;
