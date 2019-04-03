import Single from '../../single';
import { cleanObserver } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { source, callable } = this;

  source.subscribeWith({
    onSubscribe,
    onSuccess,
    onError(x) {
      callable(x);
      onError(x);
    },
  });
}

/**
 * @ignore
 */
export default (source, callable) => {
  if (typeof callable !== 'function') {
    return source;
  }

  const single = new Single(subscribeActual);
  single.source = source;
  single.callable = callable;
  return single;
};
