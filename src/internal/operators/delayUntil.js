import { LinkedCancellable } from 'rx-cancellable';
import Single from '../../single';
import { cleanObserver } from '../utils';
import is from '../is';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { source, other } = this;

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  other.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onSuccess() {
      controller.unlink();
      source.subscribeWith({
        onSubscribe(ac) {
          controller.link(ac);
        },
        onSuccess,
        onError,
      });
    },
    onError,
  });
}
/**
 * @ignore
 */
export default (source, other) => {
  if (!is(other)) {
    return source;
  }
  const single = new Single(subscribeActual);
  single.source = source;
  single.other = other;
  return single;
};
