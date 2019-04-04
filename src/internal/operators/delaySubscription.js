import AbortController from 'abort-controller';
import Single from '../../single';
import { cleanObserver, isNumber } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { amount } = this;

  let timeout;

  const controller = new AbortController();

  const { signal } = controller;

  signal.addEventListener('abort', () => {
    if (typeof timeout !== 'undefined') {
      clearTimeout(timeout);
    }
  });

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  timeout = setTimeout(() => {
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
  }, amount);
}
/**
 * @ignore
 */
export default (source, amount) => {
  if (!isNumber(amount)) {
    return source;
  }
  const single = new Single(subscribeActual);
  single.source = source;
  single.amount = amount;
  return single;
};
