import AbortController from 'abort-controller';
import Single from '../../single';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSubscribe, onError, onSuccess } = observer;

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
  if (typeof mapper !== 'function') {
    return source;
  }

  const single = new Single();
  single.source = source;
  single.mapper = mapper;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};
