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
export const toCallable = x => () => x;
