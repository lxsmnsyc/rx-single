import Single from '../../single';
import {
  isPromise, cleanObserver,
} from '../utils';
import error from './error';
import SingleEmitter from '../../single-emitter';
/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const emitter = new SingleEmitter(onSuccess, onError);

  onSubscribe(emitter);

  this.promise.then(
    x => emitter.onSuccess(x),
    x => emitter.onError(x),
  );
}
/**
 * @ignore
 */
export default (promise) => {
  if (!isPromise(promise)) {
    return error(new Error('Single.fromPromise: expects a Promise-like value.'));
  }
  const single = new Single(subscribeActual);
  single.promise = promise;
  return single;
};
