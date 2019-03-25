import Single from '../../single';
import { CompositeDisposable, cleanObserver } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const disposable = new CompositeDisposable();

  onSubscribe(disposable);

  const { source, other } = this;

  source.subscribeWith({
    onSubscribe(d) {
      disposable.add(d);
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
  other.subscribeWith({
    onSubscribe(d) {
      disposable.add(d);
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
