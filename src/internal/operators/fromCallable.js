import AbortController from 'abort-controller';
import {
  onErrorHandler, onSuccessHandler, isPromise, cleanObserver, isFunction,
} from '../utils';
import Single from '../../single';
import { error, fromPromise } from '../operators';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const controller = new AbortController();

  onSubscribe(controller);

  if (controller.signal.aborted) {
    return;
  }

  this.controller = controller;
  this.onSuccess = onSuccess;
  this.onError = onError;

  const resolve = onSuccessHandler.bind(this);
  const reject = onErrorHandler.bind(this);

  let result;
  try {
    result = this.callable();
  } catch (e) {
    reject(e);
    return;
  }

  if (isPromise(result)) {
    fromPromise(result).subscribeWith({
      onSubscribe(ac) {
        controller.signal.addEventListener('abort', () => ac.abort());
      },
      onSuccess: resolve,
      onError: reject,
    });
  } else {
    resolve(result);
  }
}
/**
 * @ignore
 */
export default (callable) => {
  if (!isFunction(callable)) {
    return error(new Error('Single.fromCallable: callable received is not a function.'));
  }
  const single = new Single(subscribeActual);
  single.callable = callable;
  return single;
};
