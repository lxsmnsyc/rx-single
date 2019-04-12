
import { CompositeCancellable } from 'rx-cancellable';
import Single from '../../single';
import { isIterable, cleanObserver, isFunction } from '../utils';
import error from './error';

const defaultZipper = x => x;
/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const result = [];

  const controller = new CompositeCancellable();

  onSubscribe(controller);

  const { sources, zipper } = this;

  const size = sources.length;

  if (size === 0) {
    onError(new Error('Single.zip: empty iterable'));
    controller.cancel();
    return;
  }
  let pending = size;

  for (let i = 0; i < size; i += 1) {
    if (controller.cancelled) {
      return;
    }
    const single = sources[i];

    if (single instanceof Single) {
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
              if (r == null) {
                throw new Error('Single.zip: zipper function returned a null value.');
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
    } else if (single != null) {
      result[i] = single;
      pending -= 1;
    } else {
      onError(new Error('Single.zip: One of the sources is undefined.'));
      controller.cancel();
      break;
    }
  }
}
/**
 * @ignore
 */
export default (sources, zipper) => {
  if (!isIterable(sources)) {
    return error(new Error('Single.zip: sources is not Iterable.'));
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
