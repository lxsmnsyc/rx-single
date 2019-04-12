import Single from '../../single';
import SingleEmitter from '../../single-emitter';
import error from './error';
import fromPromise from './fromPromise';
import {
  isPromise, cleanObserver, isFunction,
} from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const emitter = new SingleEmitter(onSuccess, onError);

  onSubscribe(emitter);

  let result;
  try {
    result = this.callable();
  } catch (e) {
    emitter.onError(e);
    return;
  }

  if (isPromise(result)) {
    fromPromise(result).subscribeWith({
      onSubscribe(ac) {
        emitter.setCancellable(ac);
      },
      onSuccess(x) {
        emitter.onSuccess(x);
      },
      onError(e) {
        emitter.onError(e);
      },
    });
  } else {
    emitter.onSuccess(result);
  }
}
/**
 * @ignore
 */
export default (callable) => {
  if (!isFunction(callable)) {
    return error(new Error('Single.fromCallable: callable received is not a function.'));
  }
  const single = new Single(subscribeActual);
  single.callable = callable;
  return single;
};
