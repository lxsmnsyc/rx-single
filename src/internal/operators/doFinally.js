import Single from '../../single';
import { cleanObserver, isFunction } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { source, callable } = this;

  let called = false;
  source.subscribeWith({
    onSubscribe(ac) {
      ac.addEventListener('cancel', () => {
        if (!called) {
          callable();
          called = true;
        }
      });
      onSubscribe(ac);
    },
    onSuccess(x) {
      onSuccess(x);
      if (!called) {
        callable();
        called = true;
      }
    },
    onError(x) {
      onError(x);
      if (!called) {
        callable();
        called = true;
      }
    },
  });
}

/**
 * @ignore
 */
export default (source, callable) => {
  if (!isFunction(callable)) {
    return source;
  }

  const single = new Single(subscribeActual);
  single.source = source;
  single.callable = callable;
  return single;
};
