import {
  onErrorHandler, onSuccessHandler, SimpleDisposable,
} from '../utils';
import Single from '../../single';
import { error } from '../operators';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  const emitter = new SimpleDisposable();
  emitter.onSuccess = onSuccessHandler.bind(this);
  emitter.onError = onErrorHandler.bind(this);

  this.disposable = emitter;
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
const create = (subscriber) => {
  if (typeof subscriber !== 'function') {
    return error('Single.create: There are no subscribers.');
  }
  const single = new Single();
  single.subscriber = subscriber;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default create;
