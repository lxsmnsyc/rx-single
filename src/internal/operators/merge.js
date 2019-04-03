import AbortController from 'abort-controller';
import Single from '../../single';
import error from './error';
import { cleanObserver } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSubscribe, onError, onSuccess } = cleanObserver(observer);

  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  this.source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onSuccess(x) {
      let result = x;
      if (!(x instanceof Single)) {
        result = error(new Error('Single.merge: source emitted a non-Single value.'));
      }
      result.subscribeWith({
        onSubscribe(ac) {
          signal.addEventListener('abort', () => ac.abort());
        },
        onSuccess(v) {
          onSuccess(v);
          controller.abort();
        },
        onError(v) {
          onError(v);
          controller.abort();
        },
      });
    },
    onError(v) {
      onError(v);
      controller.abort();
    },
  });
}

/**
 * @ignore
 */
export default (source) => {
  if (!(source instanceof Single)) {
    return error(new Error('Single.merge: source is not a Single.'));
  }

  const single = new Single(subscribeActual);
  single.source = source;
  return single;
};
