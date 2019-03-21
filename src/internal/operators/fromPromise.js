import Single from '../../single';
import {
  isPromise, onSuccessHandler, onErrorHandler, SimpleDisposable,
} from '../utils';
import { error } from '../operators';
/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  const disposable = new SimpleDisposable();

  onSubscribe(disposable);

  this.disposable = disposable;
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
const fromPromise = (promise) => {
  if (!isPromise(promise)) {
    return error('Single.fromPromise: expects a Promise-like value.');
  }
  const single = new Single();
  single.promise = promise;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default fromPromise;
