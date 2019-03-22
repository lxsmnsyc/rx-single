import Single from '../../single';
import { SimpleDisposable, isDisposable } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  let DA;
  let DB;

  const disposable = new SimpleDisposable(() => {
    if (isDisposable(DA)) {
      DA.dispose();
    }
    if (isDisposable(DB)) {
      DB.dispose();
    }
  });

  onSubscribe(disposable);

  const { source, other } = this;

  source.subscribeWith({
    onSubscribe(d) {
      DA = d;
    },
    onSuccess(x) {
      if (!disposable.isDisposed()) {
        disposable.dispose();
        onSuccess(x);
      }
    },
    onError(x) {
      if (!disposable.isDisposed()) {
        disposable.dispose();
        onError(x);
      }
    },
  });
  other.subscribeWith({
    onSubscribe(d) {
      DB = d;
    },
    onSuccess(x) {
      if (!disposable.isDisposed()) {
        disposable.dispose();
        onSuccess(x);
      }
    },
    onError(x) {
      if (!disposable.isDisposed()) {
        disposable.dispose();
        onError(x);
      }
    },
  });
}
/**
 * @ignore
 */
const ambWith = (source, other) => {
  if (!(other instanceof Single)) {
    return source;
  }
  const single = new Single();
  single.source = source;
  single.other = other;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default ambWith;
