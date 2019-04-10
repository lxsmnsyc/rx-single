import AbortController from 'abort-controller';
import Scheduler from 'rx-scheduler';
import Single from '../../single';
import { cleanObserver, isNumber } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { amount, scheduler, doDelayError } = this;

  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  this.source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => {
        ac.abort();
      });
    },
    onSuccess(x) {
      const ac = scheduler.delay(() => {
        onSuccess(x);
        controller.abort();
      }, amount);

      signal.addEventListener('abort', () => {
        ac.abort();
      });
    },
    onError(x) {
      const ac = scheduler.delay(() => {
        onError(x);
        controller.abort();
      }, doDelayError ? amount : 0);

      signal.addEventListener('abort', () => {
        ac.abort();
      });
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
