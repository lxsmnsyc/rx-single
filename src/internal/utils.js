import AbortController from 'abort-controller';
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
export const toCallable = x => () => x;
/**
 * @ignore
 */
export const isPromise = obj => (obj instanceof Promise) || (!!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function');
/**
 * @ignore
 */
export function onSuccessHandler(value) {
  const { onSuccess, onError, controller } = this;
  if (controller.signal.aborted) {
    return;
  }
  try {
    if (typeof value === 'undefined') {
      onError('onSuccess called with a null value.');
    } else {
      onSuccess(value);
    }
  } finally {
    controller.abort();
  }
}
/**
 * @ignore
 */
export function onErrorHandler(err) {
  const { onError, controller } = this;
  let report = err;
  if (!(err instanceof Error)) {
    report = new Error('onError called with a non-Error value.');
  }
  if (controller.signal.aborted) {
    return;
  }

  try {
    onError(report);
  } finally {
    controller.abort();
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
  // const disposable = new SimpleDisposable();
  const { onSubscribe, onSuccess } = cleanObserver(o);
  const controller = new AbortController();
  onSubscribe(controller);

  if (!controller.signal.aborted) {
    onSuccess(x);
    controller.abort();
  }
};
/**
 * @ignore
 */
export const immediateError = (o, x) => {
  const { onSubscribe, onError } = cleanObserver(o);
  const controller = new AbortController();
  onSubscribe(controller);

  if (!controller.signal.aborted) {
    onError(x);
    controller.abort();
  }
};
