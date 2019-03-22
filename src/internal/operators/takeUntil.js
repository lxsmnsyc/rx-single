import Single from '../../single';
import { CompositeDisposable } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSubscribe, onSuccess, onError } = observer;

  const disposable = new CompositeDisposable();

  onSubscribe(disposable);

  const { source, other } = this;

  if (!disposable.isDisposed()) {
    other.subscribeWith({
      onSubscribe(d) {
        disposable.add(d);
      },
      onSuccess() {
        onError('Single.takeUntil: Source cancelled by other Single.');
        disposable.dispose();
      },
      onError(x) {
        onError(['Single.takeUntil: Source cancelled by other Single.', x]);
        disposable.dispose();
      },
    });

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
  }
}

/**
 * @ignore
 */
const takeUntil = (source, other) => {
  if (!(other instanceof Single)) {
    return source;
  }

  const single = new Single();
  single.source = source;
  single.other = other;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default takeUntil;
