import Single from '../../single';
import { SimpleDisposable } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  const { amount } = this;

  let timeout;

  const disposable = new SimpleDisposable(() => {
    clearTimeout(timeout);
  });

  const err = (x) => {
    onError(x);
    disposable.dispose();
  };

  timeout = setTimeout(
    err,
    amount,
    'Single.timeout: TimeoutException (no success signals within the specified timeout).',
  );

  onSubscribe(disposable);

  this.source.subscribeWith({
    onSubscribe(d) {
      disposable.setDisposable(d);
    },
    onSuccess(x) {
      onSuccess(x);
      disposable.dispose();
    },
    onError: err,
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
