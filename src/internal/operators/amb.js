/* eslint-disable no-restricted-syntax */
import AbortController from 'abort-controller';
import Single from '../../single';
import { isIterable, cleanObserver } from '../utils';
import error from './error';

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

  const { sources } = this;

  for (const single of sources) {
    if (signal.aborted) {
      return;
    }

    if (single instanceof Single) {
      single.subscribeWith({
        onSubscribe(ac) {
          signal.addEventListener('abort', () => ac.abort());
        },
        // eslint-disable-next-line no-loop-func
        onSuccess(x) {
          onSuccess(x);
          controller.abort();
        },
        onError(x) {
          onError(x);
          controller.abort();
        },
      });
    } else {
      onError(new Error('Single.amb: One of the sources is a non-Single.'));
      controller.abort();
      break;
    }
  }
}
/**
 * @ignore
 */
export default (sources) => {
  if (!isIterable(sources)) {
    return error(new Error('Single.amb: sources is not Iterable.'));
  }
  const single = new Single();
  single.sources = sources;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};
