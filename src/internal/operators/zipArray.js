
import { CompositeCancellable } from 'rx-cancellable';
import Single from '../../single';
import {
  cleanObserver, isFunction, isArray, isNull, immediateError,
} from '../utils';
import error from './error';
import is from '../is';

const defaultZipper = x => x;
/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const result = [];

  const { sources, zipper } = this;

  const size = sources.length;

  if (size === 0) {
    immediateError(observer, new Error('Single.zipArray: source array is empty'));
  } else {
    const controller = new CompositeCancellable();

    onSubscribe(controller); let pending = size;

    for (let i = 0; i < size; i += 1) {
      if (controller.cancelled) {
        return;
      }
      const single = sources[i];

      if (is(single)) {
        single.subscribeWith({
          onSubscribe(ac) {
            controller.add(ac);
          },
          // eslint-disable-next-line no-loop-func
          onSuccess(x) {
            result[i] = x;
            pending -= 1;
            if (pending === 0) {
              let r;
              try {
                r = zipper(result);
                if (isNull(r)) {
                  throw new Error('Single.zipArray: zipper function returned a null value.');
                }
              } catch (e) {
                onError(e);
                controller.cancel();
                return;
              }
              onSuccess(r);
              controller.cancel();
            }
          },
          onError(x) {
            onError(x);
            controller.cancel();
          },
        });
      } else {
        onError(new Error('Single.zipArray: One of the sources is non-Single.'));
        controller.cancel();
        return;
      }
    }
  }
}
/**
 * @ignore
 */
export default (sources, zipper) => {
  if (!isArray(sources)) {
    return error(new Error('Single.zipArray: sources is a non-Array.'));
  }
  let fn = zipper;
  if (!isFunction(zipper)) {
    fn = defaultZipper;
  }
  const single = new Single(subscribeActual);
  single.sources = sources;
  single.zipper = fn;
  return single;
};
