import AbortController from 'abort-controller';
import Single from '../../single';
import { cleanObserver } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSubscribe, onSuccess, onError } = cleanObserver(observer);

  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  const { source, other } = this;

  other.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onSuccess() {
      onError(new Error('Single.takeUntil: Source cancelled by other Single.'));
      controller.abort();
    },
    onError(x) {
      onError(new Error(['Single.takeUntil: Source cancelled by other Single.', x]));
      controller.abort();
    },
  });

  source.subscribeWith({
    onSubscribe(ac) {
      if (signal.aborted) {
        ac.abort();
      } else {
        signal.addEventListener('abort', () => ac.abort());
      }
    },
    onSuccess(x) {
      onSuccess(x);
      controller.abort();
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
