import { LinkedCancellable } from 'rx-cancellable';
import Scheduler from 'rx-scheduler';
import Single from '../../single';
import { cleanObserver, isNumber } from '../utils';

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
  let sched = scheduler;
  if (!(sched instanceof Scheduler.interface)) {
    sched = Scheduler.current;
  }
  const single = new Single(subscribeActual);
  single.source = source;
  single.amount = amount;
  single.scheduler = sched;
  return single;
};
