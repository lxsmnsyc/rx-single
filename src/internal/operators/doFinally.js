import Single from '../../single';
import { SimpleDisposable } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSubscribe, onSuccess, onError } = observer;

  const { source, callable } = this;

  const disposable = new SimpleDisposable(callable);

  source.subscribeWith({
    onSubscribe(d) {
      disposable.setDisposable(d);
      onSubscribe(disposable);
    },
    onSuccess(x) {
      onSuccess(x);
      callable();
    },
    onError(x) {
      onError(x);
      callable();
    },
  });
}

/**
 * @ignore
 */
const doAfterTerminate = (source, callable) => {
  if (typeof callable !== 'function') {
    return source;
  }

  const single = new Single();
  single.source = source;
  single.callable = callable;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default doAfterTerminate;
