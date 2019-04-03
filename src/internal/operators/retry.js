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

  const { source, bipredicate } = this;

  let retries = 0;

  const sub = () => {
    if (signal.aborted) {
      return;
    }
    retries += 1;

    source.subscribeWith({
      onSubscribe(ac) {
        signal.addEventListener('abort', () => ac.abort());
      },
      onSuccess(x) {
        onSuccess(x);
        controller.abort();
      },
      onError(x) {
        if (typeof bipredicate === 'function') {
          const result = bipredicate(retries, x);

          if (result) {
            sub();
          } else {
            onError(x);
            controller.abort();
          }
        } else {
          sub();
        }
      },
    });
  };

  sub();
}

/**
 * @ignore
 */
export default (source, bipredicate) => {
  const single = new Single(subscribeActual);
  single.source = source;
  single.bipredicate = bipredicate;
  return single;
};
