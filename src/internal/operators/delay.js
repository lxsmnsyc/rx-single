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

  onSubscribe(disposable);

  this.source.subscribeWith({
    onSubscribe(d) {
      disposable.setDisposable(d);
    },
    onSuccess(x) {
      timeout = setTimeout(() => {
        onSuccess(x);
        disposable.dispose();
      }, amount);
    },
    onError(x) {
      timeout = setTimeout(() => {
        onError(x);
        disposable.dispose();
      }, doDelayError ? amount : 0);
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
