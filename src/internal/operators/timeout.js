import Single from '../../single';
import { SimpleDisposable } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  const { amount } = this;

  let parent;
  const timeout = setTimeout(
    onError,
    amount,
    'Single.timeout: TimeoutException (no success signals within the specified timeout).',
  );

  const disposable = new SimpleDisposable(() => {
    if (typeof parent !== 'undefined') {
      parent.dispose();
    }
    clearTimeout(timeout);
  });

  this.source.subscribeWith({
    onSubscribe(d) {
      parent = d;
      onSubscribe(disposable);
    },
    onSuccess(x) {
      disposable.dispose();
      onSuccess(x);
    },
    onError(x) {
      disposable.dispose();
      onError(x);
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
