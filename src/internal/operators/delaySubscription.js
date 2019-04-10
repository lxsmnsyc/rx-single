import AbortController from 'abort-controller';
import Scheduler from 'rx-scheduler';
import Single from '../../single';
import { cleanObserver, isNumber } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { amount, scheduler } = this;
  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  const abortable = scheduler.delay(() => {
    this.source.subscribeWith({
      onSubscribe(ac) {
        signal.addEventListener('abort', () => ac.abort());
      },
      onSuccess(x) {
        onSuccess(x);
        controller.abort();
      },
      onError(x) {
        onError(x);
        controller.abort();
      },
    });
  }, amount);

  signal.addEventListener('abort', () => abortable.abort());
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
