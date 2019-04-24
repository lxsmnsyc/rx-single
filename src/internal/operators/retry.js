
import { LinkedCancellable } from 'rx-cancellable';
import Single from '../../single';
import { cleanObserver, isFunction } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSubscribe, onSuccess, onError } = cleanObserver(observer);

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  const { source, bipredicate } = this;

  let retries = -1;

  const sub = () => {
    retries += 1;
    controller.unlink();
    source.subscribeWith({
      onSubscribe(ac) {
        controller.link(ac);
      },
      onSuccess,
      onError(x) {
        if (isFunction(bipredicate)) {
          const result = bipredicate(retries, x);

          if (result) {
            sub();
          } else {
            onError(x);
            controller.cancel();
          }
        } else {
          sub();
        }
      },
    });
  };

  sub();
}

/**
 * @ignore
 */
export default (source, bipredicate) => {
  const single = new Single(subscribeActual);
  single.source = source;
  single.bipredicate = bipredicate;
  return single;
};
