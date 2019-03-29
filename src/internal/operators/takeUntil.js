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
      if (!signal.aborted) {
        onError(new Error('Single.takeUntil: Source cancelled by other Single.'));
        controller.abort();
      }
    },
    onError(x) {
      if (!signal.aborted) {
        onError(new Error(['Single.takeUntil: Source cancelled by other Single.', x]));
        controller.abort();
      }
    },
  });

  source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onSuccess(x) {
      if (!signal.aborted) {
        onSuccess(x);
        controller.abort();
      }
    },
    onError(x) {
      if (!signal.aborted) {
        onError(x);
        controller.abort();
      }
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

  const single = new Single();
  single.source = source;
  single.other = other;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default takeUntil;
