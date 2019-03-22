import Single from '../../single';
import { SimpleDisposable } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSubscribe, onSuccess, onError } = observer;

  const { source, callable } = this;

  const disposable = new SimpleDisposable(callable);

  onSubscribe(disposable);

  source.subscribeWith({
    onSubscribe(d) {
      disposable.setDisposable(d);
    },
    onSuccess(x) {
      onSuccess(x);
      disposable.dispose();
    },
    onError(x) {
      onError(x);
      disposable.dispose();
    },
  });
}

/**
 * @ignore
 */
const doOnDispose = (source, callable) => {
  if (typeof callable !== 'function') {
    return source;
  }

  const single = new Single();
  single.source = source;
  single.callable = callable;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default doOnDispose;
