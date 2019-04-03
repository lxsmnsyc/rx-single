import AbortController from 'abort-controller';
import Single from '../../single';
import { cleanObserver } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  const sharedSuccess = (x) => {
    if (!signal.aborted) {
      onSuccess(x);
      controller.abort();
    }
  };
  const sharedError = (x) => {
    if (!signal.aborted) {
      onError(x);
      controller.abort();
    }
  };

  const { source, other } = this;

  source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onSuccess: sharedSuccess,
    onError: sharedError,
  });
  other.subscribeWith({
    onSubscribe(ac) {
      if (signal.aborted) {
        ac.abort();
      } else {
        signal.addEventListener('abort', () => ac.abort());
      }
    },
    onSuccess: sharedSuccess,
    onError: sharedError,
  });
}
/**
 * @ignore
 */
export default (source, other) => {
  if (!(other instanceof Single)) {
    return source;
  }
  const single = new Single(subscribeActual);
  single.source = source;
  single.other = other;
  return single;
};
