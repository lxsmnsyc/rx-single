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

      if (typeof SB !== 'undefined') {
        let result;

        try {
          result = zipper(SA, SB);

          if (typeof result === 'undefined') {
            throw new Error('Single.zipWith: zipper function returned an undefined value.');
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
      signal.addEventListener('abort', () => ac.abort());
    },
    onSuccess(x) {
      if (signal.aborted) {
        return;
      }
      SB = x;

      if (typeof SA !== 'undefined') {
        let result;

        try {
          result = zipper(SA, SB);

          if (typeof result === 'undefined') {
            throw new Error('Single.zipWith: zipper function returned an undefined value.');
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
