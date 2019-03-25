import Single from '../../single';
import { isIterable, CompositeDisposable, cleanObserver } from '../utils';
import error from './error';

const defaultZipper = x => x;
/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const result = [];

  const disposable = new CompositeDisposable();

  onSubscribe(disposable);

  const { sources, zipper } = this;

  const size = sources.length;

  if (size === 0) {
    onError(new Error('Single.zip: empty iterable'));
    disposable.dispose();
    return;
  }
  let pending = size;

  for (let i = 0; i < size; i += 1) {
    if (disposable.isDisposed()) {
      return;
    }
    const single = sources[i];

    if (single instanceof Single) {
      single.subscribeWith({
        onSubscribe(d) {
          disposable.add(d);
        },
        // eslint-disable-next-line no-loop-func
        onSuccess(x) {
          if (!disposable.isDisposed()) {
            result[i] = x;
            pending -= 1;
            if (pending === 0) {
              let r;
              try {
                r = zipper(result);
                if (typeof r === 'undefined') {
                  throw new Error('Single.zip: zipper function returned an undefined value.');
                }
              } catch (e) {
                onError(e);
                disposable.dispose();
                return;
              }
              onSuccess(r);
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
    } else if (typeof single !== 'undefined') {
      result[i] = single;
      pending -= 1;
    } else {
      onError(new Error('Single.zip: One of the sources is undefined.'));
      disposable.dispose();
      break;
    }
  }
}
/**
 * @ignore
 */
const zip = (sources, zipper) => {
  if (!isIterable(sources)) {
    return error(new Error('Single.zip: sources is not Iterable.'));
  }
  let fn = zipper;
  if (typeof zipper !== 'function') {
    fn = defaultZipper;
  }
  const single = new Single();
  single.sources = sources;
  single.zipper = fn;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default zip;
