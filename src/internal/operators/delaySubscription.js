import { LinkedCancellable } from 'rx-cancellable';
import Single from '../../single';
import { cleanObserver, isNumber, defaultScheduler } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { amount, scheduler, source } = this;
  const controller = new LinkedCancellable();

  onSubscribe(controller);

  controller.link(
    scheduler.delay(() => {
      controller.unlink();
      source.subscribeWith({
        onSubscribe(ac) {
          controller.link(ac);
        },
        onSuccess,
        onError,
      });
    }, amount),
  );
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
