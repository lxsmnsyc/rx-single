import {
  DISPOSED, onErrorHandler, onSuccessHandler, isPromise,
} from '../utils';
import Single from '../../single';
import { error, fromPromise } from '../operators';

/**
 * @ignore
 */
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

  let result;
  try {
    result = this.callable();
  } catch (e) {
    reject(e);
    return;
  }

  if (isPromise(result)) {
    fromPromise(result).subscribe(onSuccess, onError);
  } else {
    resolve(result);
  }
}
/**
 * @ignore
 */
const fromCallable = (callable) => {
  if (typeof callable !== 'function') {
    return error('Single.fromCallable: callable received is not a function.');
  }
  const single = new Single();
  single.callable = callable;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default fromCallable;
