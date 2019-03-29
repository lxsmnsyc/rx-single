import AbortController from 'abort-controller';
import Single from '../../single';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

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
  if (typeof amount !== 'number') {
    return source;
  }
  const single = new Single();
  single.source = source;
  single.amount = amount;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};
