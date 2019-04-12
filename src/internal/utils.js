import { BooleanCancellable } from 'rx-cancellable';
/**
 * @ignore
 */
// eslint-disable-next-line valid-typeof
const isType = (x, y) => typeof x === y;
/**
 * @ignore
 */
export const isFunction = x => isType(x, 'function');
/**
 * @ignore
 */
export const isNumber = x => isType(x, 'number');
/**
 * @ignore
 */
export const isObject = x => isType(x, 'object');
/**
 * @ignore
 */
export const isIterable = obj => isObject(obj) && isFunction(obj[Symbol.iterator]);
/**
 * @ignore
 */
export const isObserver = obj => isObject(obj) && isFunction(obj.onSubscribe);
/**
 * @ignore
 */
export const toCallable = x => () => x;
/**
 * @ignore
 */
export const isPromise = (obj) => {
  if (obj == null) return false;
  if (obj instanceof Promise) return true;
  return (isObject(obj) || isFunction(obj)) && isFunction(obj.then);
};
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
  onSuccess: isFunction(x.onSuccess) ? x.onSuccess : identity,
  onError: isFunction(x.onError) ? x.onError : throwError,
});
/**
 * @ignore
 */
export const immediateSuccess = (o, x) => {
  const { onSubscribe, onSuccess } = cleanObserver(o);
  const controller = new BooleanCancellable();
  onSubscribe(controller);

  if (!controller.cancelled) {
    onSuccess(x);
    controller.cancel();
  }
};
/**
 * @ignore
 */
export const immediateError = (o, x) => {
  const { onSubscribe, onError } = cleanObserver(o);
  const controller = new BooleanCancellable();
  onSubscribe(controller);

  if (!controller.cancelled) {
    onError(x);
    controller.cancel();
  }
};
