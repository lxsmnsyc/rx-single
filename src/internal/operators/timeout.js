import Single from '../../single';
import { SimpleDisposable } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  const { amount } = this;

  const timeout = setTimeout(
    onError,
    amount,
    'Single.timeout: TimeoutException (no success signals within the specified timeout).',
  );

  const disposable = new SimpleDisposable(() => {
    clearTimeout(timeout);
  });

  onSubscribe(disposable);

  this.source.subscribeWith({
    onSubscribe(d) {
      disposable.setDisposable(d);
    },
    onSuccess(x) {
      onSuccess(x);
      disposable.dispose();
    },
    onError(x) {
      onError(x);
      disposable.dispose();
    },
  });
}
/**
 * @ignore
 */
const timeout = (source, amount) => {
  if (typeof amount !== 'number') {
    return source;
  }
  const single = new Single();
  single.source = source;
  single.amount = amount;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default timeout;
