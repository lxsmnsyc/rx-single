import Single from '../../single';
import { SimpleDisposable } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  let parent;
  let timeout;

  const disposable = new SimpleDisposable(() => {
    if (typeof parent !== 'undefined') {
      parent.dispose();
    }
    if (typeof timeout !== 'undefined') {
      clearTimeout(timeout);
    }
  });

  const { amount, doDelayError } = this;

  this.source.subscribeWith({
    onSubscribe(d) {
      parent = d;
      onSubscribe(disposable);
    },
    onSuccess(x) {
      if (!disposable.isDisposed()) {
        timeout = setTimeout(() => {
          disposable.dispose();
          onSuccess(x);
        }, amount);
      }
    },
    onError(x) {
      if (!disposable.isDisposed()) {
        timeout = setTimeout(() => {
          disposable.dispose();
          onError(x);
        }, doDelayError ? amount : 0);
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
