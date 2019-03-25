import Single from '../../single';
import { CompositeDisposable, cleanObserver } from '../utils';

/**
 * @ignore
 */
const defaultZipper = (x, y) => [x, y];
/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  let SA;
  let SB;

  const disposable = new CompositeDisposable();

  onSubscribe(disposable);

  const { source, other, zipper } = this;

  source.subscribeWith({
    onSubscribe(d) {
      disposable.add(d);
    },
    onSuccess(x) {
      if (!disposable.isDisposed()) {
        SA = x;

        if (typeof SB !== 'undefined') {
          let result;

          try {
            result = zipper(SA, SB);

            if (typeof result === 'undefined') {
              throw new Error('Single.zipWith: zipper function returned an undefined value.');
            }
          } catch (e) {
            onError(e);
            disposable.dispose();
            return;
          }
          onSuccess(result);
          disposable.dispose();
        }
      }
    },
    onError(x) {
      if (!disposable.isDisposed()) {
        onError(x);
        disposable.dispose();
      }
    },
  });

  other.subscribeWith({
    onSubscribe(d) {
      disposable.add(d);
    },
    onSuccess(x) {
      if (!disposable.isDisposed()) {
        SB = x;

        if (typeof SA !== 'undefined') {
          let result;

          try {
            result = zipper(SA, SB);

            if (typeof result === 'undefined') {
              throw new Error('Single.zipWith: zipper function returned an undefined value.');
            }
          } catch (e) {
            onError(e);
            disposable.dispose();
            return;
          }
          onSuccess(result);
          disposable.dispose();
        }
      }
    },
    onError(x) {
      if (!disposable.isDisposed()) {
        onError(x);
        disposable.dispose();
      }
    },
  });
}
/**
 * @ignore
 */
const zipWith = (source, other, zipper) => {
  if (!(other instanceof Single)) {
    return source;
  }
  let fn = zipper;
  if (typeof zipper !== 'function') {
    fn = defaultZipper;
  }
  const single = new Single();
  single.source = source;
  single.other = other;
  single.zipper = fn;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default zipWith;
