import Single from '../../single';
import { SimpleDisposable } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  const { amount } = this;

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

  onSubscribe(disposable);

  timeout = setTimeout(() => {
    this.source.subscribeWith({
      onSubscribe(d) {
        parent = d;
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
  }, amount);
}
/**
 * @ignore
 */
const delaySubscription = (source, amount) => {
  if (typeof amount !== 'number') {
    return source;
  }
  const single = new Single();
  single.source = source;
  single.amount = amount;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default delaySubscription;
