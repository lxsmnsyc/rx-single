import Single from '../../single';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSubscribe, onSuccess, onError } = observer;

  const { source, callable } = this;

  source.subscribeWith({
    onSubscribe,
    onSuccess(x) {
      callable(x);
      onSuccess(x);
    },
    onError,
  });
}

/**
 * @ignore
 */
const doOnSuccess = (source, callable) => {
  if (typeof callable !== 'function') {
    return source;
  }

  const single = new Single();
  single.source = source;
  single.callable = callable;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default doOnSuccess;
