import { LinkedCancellable } from 'rx-cancellable';
import Scheduler from 'rx-scheduler';
import Single from '../../single';
import { cleanObserver, isNumber } from '../utils';

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
  let sched = scheduler;
  if (!(sched instanceof Scheduler.interface)) {
    sched = Scheduler.current;
  }
  const single = new Single(subscribeActual);
  single.source = source;
  single.amount = amount;
  single.scheduler = sched;
  single.doDelayError = doDelayError;
  return single;
};
