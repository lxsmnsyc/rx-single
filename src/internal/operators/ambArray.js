/* eslint-disable no-restricted-syntax */
import { CompositeCancellable } from 'rx-cancellable';
import Single from '../../single';
import { cleanObserver, immediateError, isArray } from '../utils';
import error from './error';
import is from '../is';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { sources } = this;
  const { length } = sources;

  if (length === 0) {
    immediateError(observer, new Error('Single.ambArray: sources Array is empty.'));
  } else {
    const controller = new CompositeCancellable();

    onSubscribe(controller);

    for (let i = 0; i < length; i += 1) {
      const single = sources[i];
      if (controller.cancelled) {
        return;
      }
      if (is(single)) {
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
        onError(new Error('Single.ambArray: One of the sources is a non-Single.'));
        controller.cancel();
        break;
      }
    }
  }
}
/**
 * @ignore
 */
export default (sources) => {
  if (!isArray(sources)) {
    return error(new Error('Single.ambArray: sources is not an Array.'));
  }
  const single = new Single(subscribeActual);
  single.sources = sources;
  return single;
};
