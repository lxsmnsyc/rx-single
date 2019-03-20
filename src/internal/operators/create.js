import {
  DISPOSED, isDisposable, onErrorHandler, onSuccessHandler,
} from '../utils';
import Single from '../../single';
import { error } from '../operators';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  let disposable;
  const emitter = {
    onSuccess: onSuccessHandler.bind(this),
    onError: onErrorHandler.bind(this),
    setDisposable(d) {
      if (isDisposable(d)) {
        disposable = d;
      }
    },
    dispose() {
      if (isDisposable(disposable)) {
        disposable.dispose();
      }
      disposable = DISPOSED;
    },
    isDisposed() {
      return disposable === DISPOSED;
    },
  };

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
