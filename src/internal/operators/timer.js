import Single from '../../single';
import { SimpleDisposable } from '../utils';
import { error } from '../operators';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onSubscribe } = observer;

  let timeout;

  const disposable = new SimpleDisposable(() => {
    if (typeof timeout !== 'undefined') {
      clearTimeout(timeout);
    }
  });

  onSubscribe(disposable);

  timeout = setTimeout(() => {
    onSuccess(0);
    disposable.dispose();
  }, this.amount);
}
/**
 * @ignore
 */
const timer = (amount) => {
  if (typeof amount !== 'number') {
    return error('Single.timer: "amount" is not a number.');
  }
  const single = new Single();
  single.amount = amount;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default timer;
