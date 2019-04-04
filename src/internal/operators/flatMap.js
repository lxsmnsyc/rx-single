import AbortController from 'abort-controller';
import Single from '../../single';
import { cleanObserver, isFunction } from '../utils';

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

  const { mapper, source } = this;

  source.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onSuccess(x) {
      let result;
      try {
        result = mapper(x);

        if (!(result instanceof Single)) {
          throw new Error('Single.flatMap: mapper returned a non-Single');
        }
      } catch (e) {
        onError(e);
        return;
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
export default (source, mapper) => {
  if (!isFunction(mapper)) {
    return source;
  }

  const single = new Single(subscribeActual);
  single.source = source;
  single.mapper = mapper;
  return single;
};
