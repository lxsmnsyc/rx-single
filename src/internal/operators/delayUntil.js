import AbortController from 'abort-controller';
import Single from '../../single';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  const { source, other } = this;

  const controller = new AbortController();

  const { signal } = controller;

  onSubscribe(controller);

  if (signal.aborted) {
    return;
  }

  other.subscribeWith({
    onSubscribe(ac) {
      signal.addEventListener('abort', () => ac.abort());
    },
    onSuccess() {
      if (!signal.aborted) {
        source.subscribeWith({
          onSubscribe(ac) {
            signal.addEventListener('abort', () => ac.abort());
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
export default (source, other) => {
  if (!(other instanceof Single)) {
    return source;
  }
  const single = new Single();
  single.source = source;
  single.other = other;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};
