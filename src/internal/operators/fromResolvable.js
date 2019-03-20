import { DISPOSED, onErrorHandler, onSuccessHandler } from '../utils';
import Single from '../../single';
import { error } from '../operators';

function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  let state;
  const disposable = {
    dispose() {
      state = DISPOSED;
    },
    isDisposed: () => state === DISPOSED,
  };

  onSubscribe(disposable);

  this.disposable = disposable;
  this.onSuccess = onSuccess;
  this.onError = onError;

  const resolve = onSuccessHandler.bind(this);
  const reject = onErrorHandler.bind(this);

  this.subscriber(resolve, reject);
}
/**
 * @ignore
 */
const fromResolvable = (subscriber) => {
  if (typeof subscriber !== 'function') {
    return error('Single.fromResolvable: There are no subscribers.');
  }
  const single = new Single();
  single.subscriber = subscriber;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default fromResolvable;
