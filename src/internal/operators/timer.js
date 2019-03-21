import Single from '../../single';
import { DISPOSED } from '../utils';
import { error } from '../operators';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onSubscribe } = observer;

  let state;
  let timeout;

  const disposable = {
    dispose() {
      if (typeof timeout !== 'undefined') {
        clearTimeout(timeout);
      }
      state = DISPOSED;
    },

    isDisposed() {
      return state === DISPOSED;
    },
  };

  onSubscribe(disposable);

  const { amount } = this;

  timeout = setTimeout(onSuccess, amount, 0);
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
