/* eslint-disable no-restricted-syntax */
import { CompositeCancellable } from 'rx-cancellable';
import Single from '../../single';
import { isIterable, cleanObserver } from '../utils';
import error from './error';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const controller = new CompositeCancellable();

  onSubscribe(controller);

  const { sources } = this;

  for (const single of sources) {
    if (controller.cancelled) {
      return;
    }

    if (single instanceof Single) {
      single.subscribeWith({
        onSubscribe(c) {
          controller.add(c);
        },
        // eslint-disable-next-line no-loop-func
        onSuccess(x) {
          onSuccess(x);
          controller.cancel();
        },
        onError(x) {
          onError(x);
          controller.cancel();
        },
      });
    } else {
      onError(new Error('Single.amb: One of the sources is a non-Single.'));
      controller.cancel();
      break;
    }
  }
}
/**
 * @ignore
 */
export default (sources) => {
  if (!isIterable(sources)) {
    return error(new Error('Single.amb: sources is not Iterable.'));
  }
  const single = new Single(subscribeActual);
  single.sources = sources;
  return single;
};
