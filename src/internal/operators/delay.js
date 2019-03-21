import Single from '../../single';
import { SimpleDisposable } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  let timeout;

  const disposable = new SimpleDisposable(() => {
    if (typeof timeout !== 'undefined') {
      clearTimeout(timeout);
    }
  });

  const { amount, doDelayError } = this;

  this.source.subscribeWith({
    onSubscribe(d) {
      const { setDisposable } = d;
      if (typeof setDisposable === 'function') {
        setDisposable(disposable);
      }
      onSubscribe(disposable);
    },
    onSuccess(x) {
      if (!disposable.isDisposed()) {
        timeout = setTimeout(onSuccess, amount, x);
      }
    },
    onError(x) {
      if (!disposable.isDisposed()) {
        timeout = setTimeout(onError, amount, doDelayError ? x : 0);
      }
    },
  });
}
/**
 * @ignore
 */
const delay = (source, amount, doDelayError) => {
  if (typeof amount !== 'number') {
    return source;
  }
  const single = new Single();
  single.source = source;
  single.amount = amount;
  single.doDelayError = doDelayError;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default delay;
