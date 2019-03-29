
import AbortController from 'abort-controller';
import Single from '../../single';
import { cleanObserver } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { amount } = this;

  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  const timeout = setTimeout(
    () => {
      onError(new Error('Single.timeout: TimeoutException (no success signals within the specified timeout).'));
      controller.abort();
    },
    amount,
  );

  signal.addEventListener('abort', () => {
    clearTimeout(timeout);
  });

  this.source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onSuccess(x) {
      onSuccess(x);
      controller.abort();
    },
    onError(x) {
      onError(x);
      controller.abort();
    },
  });
}
/**
 * @ignore
 */
export default (source, amount) => {
  if (typeof amount !== 'number') {
    return source;
  }
  const single = new Single();
  single.source = source;
  single.amount = amount;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};
