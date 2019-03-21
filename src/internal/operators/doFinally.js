import Single from '../../single';
import { SimpleDisposable } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSubscribe, onSuccess, onError } = observer;

  const { source, callable } = this;

  let called = false;
  const disposable = new SimpleDisposable(() => {
    if (!called) {
      callable();
      called = true;
    }
  });

  source.subscribeWith({
    onSubscribe(d) {
      disposable.setDisposable(d);
      onSubscribe(disposable);
    },
    onSuccess(x) {
      onSuccess(x);
      if (!called) {
        callable();
        called = true;
      }
    },
    onError(x) {
      onError(x);
      if (!called) {
        callable();
        called = true;
      }
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
