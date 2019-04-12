
import { CompositeCancellable } from 'rx-cancellable';
import Single from '../../single';
import { cleanObserver } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSubscribe, onSuccess, onError } = cleanObserver(observer);

  const controller = new CompositeCancellable();

  onSubscribe(controller);

  const { source, other } = this;

  other.subscribeWith({
    onSubscribe(ac) {
      controller.add(ac);
    },
    onSuccess() {
      onError(new Error('Single.takeUntil: Source cancelled by other Single.'));
      controller.cancel();
    },
    onError(x) {
      onError(new Error(['Single.takeUntil: Source cancelled by other Single.', x]));
      controller.cancel();
    },
  });

  source.subscribeWith({
    onSubscribe(ac) {
      controller.add(ac);
    },
    onSuccess(x) {
      onSuccess(x);
      controller.cancel();
    },
    onError(x) {
      onError(x);
      controller.cancel();
    },
  });
}

/**
 * @ignore
 */
const takeUntil = (source, other) => {
  if (!(other instanceof Single)) {
    return source;
  }

  const single = new Single(subscribeActual);
  single.source = source;
  single.other = other;
  return single;
};

export default takeUntil;
