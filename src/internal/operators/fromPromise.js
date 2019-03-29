import AbortController from 'abort-controller';
import Single from '../../single';
import {
  isPromise, onSuccessHandler, onErrorHandler,
} from '../utils';
import { error } from '../operators';
/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  const controller = new AbortController();

  onSubscribe(controller);

  if (controller.signal.aborted) {
    return;
  }

  this.controller = controller;
  this.onSuccess = onSuccess;
  this.onError = onError;

  this.promise.then(
    onSuccessHandler.bind(this),
    onErrorHandler.bind(this),
  );
}
/**
 * @ignore
 */
export default (promise) => {
  if (!isPromise(promise)) {
    return error(new Error('Single.fromPromise: expects a Promise-like value.'));
  }
  const single = new Single();
  single.promise = promise;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};
