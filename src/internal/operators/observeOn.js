
import Scheduler from 'rx-scheduler';
import { LinkedCancellable } from 'rx-cancellable';
import Single from '../../single';
import { cleanObserver } from '../utils';

function subscribeActual(observer) {
  const { onSubscribe, onSuccess, onError } = cleanObserver(observer);

  const { source, scheduler } = this;

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onSuccess(x) {
      controller.link(scheduler.schedule(() => {
        onSuccess(x);
      }));
    },
    onError(x) {
      controller.link(scheduler.schedule(() => {
        onError(x);
      }));
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
