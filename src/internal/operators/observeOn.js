import AbortController from 'abort-controller';
import Scheduler from 'rx-scheduler';
import Single from '../../single';
import { cleanObserver } from '../utils';

function subscribeActual(observer) {
  const { onSubscribe, onSuccess, onError } = cleanObserver(observer);

  const { source, scheduler } = this;

  const controller = new AbortController();
  onSubscribe(controller);

  const { signal } = controller;

  if (signal.aborted) {
    return;
  }

  source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onSuccess(x) {
      scheduler.schedule(() => {
        onSuccess(x);
        controller.abort();
      });
    },
    onError(x) {
      scheduler.schedule(() => {
        onError(x);
        controller.abort();
      });
    },
  });
}
/**
 * @ignore
 */
export default (source, scheduler) => {
  let sched = scheduler;
  if (!(sched instanceof Scheduler.interface)) {
    sched = Scheduler.current;
  }
  const single = new Single(subscribeActual);
  single.source = source;
  single.scheduler = sched;
  return single;
};
