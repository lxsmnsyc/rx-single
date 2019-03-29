import AbortController from 'abort-controller';
import {
  onErrorHandler, onSuccessHandler, cleanObserver,
} from '../utils';
import Single from '../../single';
import { error } from '../operators';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const emitter = new AbortController();
  emitter.onSuccess = onSuccessHandler.bind(this);
  emitter.onError = onErrorHandler.bind(this);

  this.controller = emitter;
  this.onSuccess = onSuccess;
  this.onError = onError;

  onSubscribe(emitter);

  try {
    this.subscriber(emitter);
  } catch (ex) {
    emitter.onError(ex);
  }
}
/**
 * @ignore
 */
export default (subscriber) => {
  if (typeof subscriber !== 'function') {
    return error(new Error('Single.create: There are no subscribers.'));
  }
  const single = new Single();
  single.subscriber = subscriber;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};
