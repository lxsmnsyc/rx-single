import { LinkedCancellable } from 'rx-cancellable';
import Single from '../../single';
import { cleanObserver, isNumber, defaultScheduler } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { amount, scheduler } = this;

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  const timeout = scheduler.delay(
    () => {
      onError(new Error('Single.timeout: TimeoutException (no success signals within the specified timeout).'));
      controller.cancel();
    },
    amount,
  );

  controller.addEventListener('cancel', () => timeout.cancel());

  this.source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onSuccess,
    onError,
  });
}
/**
 * @ignore
 */
export default (source, amount, scheduler) => {
  if (!isNumber(amount)) {
    return source;
  }
  const single = new Single(subscribeActual);
  single.source = source;
  single.amount = amount;
  single.scheduler = defaultScheduler(scheduler);
  return single;
};
