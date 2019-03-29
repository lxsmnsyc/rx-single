import AbortController from 'abort-controller';
import { onErrorHandler, onSuccessHandler } from '../utils';
import Single from '../../single';
import error from './error';

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

  const resolve = onSuccessHandler.bind(this);
  const reject = onErrorHandler.bind(this);

  this.subscriber(resolve, reject);
}
/**
 * @ignore
 */
export default (subscriber) => {
  if (typeof subscriber !== 'function') {
    return error(new Error('Single.fromResolvable: expects a function.'));
  }
  const single = new Single();
  single.subscriber = subscriber;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};
