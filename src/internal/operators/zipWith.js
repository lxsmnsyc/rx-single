import Single from '../../single';
import { SimpleDisposable, isDisposable } from '../utils';

/**
 * @ignore
 */
const defaultZipper = (x, y) => [x, y];
/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  let DA;
  let DB;
  let SA;
  let SB;

  const disposable = new SimpleDisposable(() => {
    if (isDisposable(DA)) {
      DA.dispose();
    }
    if (isDisposable(DB)) {
      DB.dispose();
    }
  });

  onSubscribe(disposable);

  const { source, other, zipper } = this;

  source.subscribeWith({
    onSubscribe(d) {
      DA = d;
    },
    onSuccess(x) {
      SA = x;

      if (typeof SB !== 'undefined') {
        disposable.dispose();
        let result;

        try {
          result = zipper(SA, SB);

          if (typeof result === 'undefined') {
            throw new Error('Single.zipWith: zipper function returned an undefined value.');
          }
        } catch (e) {
          onError(e);
          return;
        }
        onSuccess(result);
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
            return;
          }
          onSuccess(result);
        }
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
