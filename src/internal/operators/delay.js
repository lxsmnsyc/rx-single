import { LinkedCancellable } from 'rx-cancellable';
import Single from '../../single';
import { cleanObserver, isNumber, defaultScheduler } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { amount, scheduler, doDelayError } = this;

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  this.source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onSuccess(x) {
      controller.link(
        scheduler.delay(() => {
          onSuccess(x);
        }, amount),
      );
    },
    onError(x) {
      controller.link(
        scheduler.delay(() => {
          onError(x);
        }, doDelayError ? amount : 0),
      );
    },
  });
}
/**
 * @ignore
 */
export default (source, amount, scheduler, doDelayError) => {
  if (!isNumber(amount)) {
    return source;
  }
  const single = new Single(subscribeActual);
  single.source = source;
  single.amount = amount;
  single.scheduler = defaultScheduler(scheduler);
  single.doDelayError = doDelayError;
  return single;
};
