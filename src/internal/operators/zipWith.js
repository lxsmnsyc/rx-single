import AbortController from 'abort-controller';
import Single from '../../single';
import { cleanObserver } from '../utils';

/**
 * @ignore
 */
const defaultZipper = (x, y) => [x, y];
/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  let SA;
  let SB;

  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  const { source, other, zipper } = this;

  source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onSuccess(x) {
      if (signal.aborted) {
        return;
      }
      SA = x;

      if (SB != null) {
        let result;

        try {
          result = zipper(SA, SB);

          if (result == null) {
            throw new Error('Single.zipWith: zipper function returned a null value.');
          }
        } catch (e) {
          onError(e);
          controller.abort();
          return;
        }
        onSuccess(result);
        controller.abort();
      }
    },
    onError(x) {
      onError(x);
      controller.abort();
    },
  });

  other.subscribeWith({
    onSubscribe(ac) {
      if (signal.aborted) {
        ac.abort();
      } else {
        signal.addEventListener('abort', () => ac.abort());
      }
    },
    onSuccess(x) {
      if (signal.aborted) {
        return;
      }
      SB = x;

      if (SA != null) {
        let result;

        try {
          result = zipper(SA, SB);

          if (result == null) {
            throw new Error('Single.zipWith: zipper function returned a null value.');
          }
        } catch (e) {
          onError(e);
          controller.abort();
          return;
        }
        onSuccess(result);
        controller.abort();
      }
    },
    onError(x) {
      onError(x);
      controller.abort();
    },
  });
}
/**
 * @ignore
 */
export default (source, other, zipper) => {
  if (!(other instanceof Single)) {
    return source;
  }
  let fn = zipper;
  if (typeof zipper !== 'function') {
    fn = defaultZipper;
  }
  const single = new Single();
  single.source = source;
  single.other = other;
  single.zipper = fn;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};
