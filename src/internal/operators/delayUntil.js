import Single from '../../single';
import { SimpleDisposable } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  const { source, other } = this;

  const disposable = new SimpleDisposable();

  onSubscribe(disposable);

  other.subscribeWith({
    onSubscribe(d) {
      disposable.setDisposable(d);
    },
    onSuccess() {
      if (!disposable.isDisposed()) {
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
const delayUntil = (source, other) => {
  if (!(other instanceof Single)) {
    return source;
  }
  const single = new Single();
  single.source = source;
  single.other = other;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default delayUntil;
