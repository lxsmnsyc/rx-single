import AbortController from 'abort-controller';
import {
  onErrorHandler, onSuccessHandler, cleanObserver, isFunction,
} from '../utils';
import Single from '../../single';
import error from './error';

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

  this.subscriber(resolve, reject);
}
/**
 * @ignore
 */
export default (subscriber) => {
  if (!isFunction(subscriber)) {
    return error(new Error('Single.fromResolvable: expects a function.'));
  }
  const single = new Single(subscribeActual);
  single.subscriber = subscriber;
  return single;
};
