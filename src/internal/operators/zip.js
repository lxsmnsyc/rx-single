import Single from '../../single';
import { SimpleDisposable, isDisposable, isIterable } from '../utils';
import error from './error';

const defaultZipper = x => x;
/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  const composite = [];
  const result = [];

  const disposable = new SimpleDisposable(() => {
    // eslint-disable-next-line no-restricted-syntax
    for (const d of composite) {
      if (isDisposable(d)) {
        d.dispose();
      }
    }
  });

  onSubscribe(disposable);

  const { sources, zipper } = this;

  const size = sources.length;
  let pending = size;

  for (let i = 0; i < size; i += 1) {
    if (disposable.isDisposed()) {
      return;
    }
    const single = sources[i];

    if (single instanceof Single) {
      single.subscribeWith({
        onSubscribe(d) {
          composite[i] = d;
        },
        // eslint-disable-next-line no-loop-func
        onSuccess(x) {
          if (!disposable.isDisposed()) {
            result[i] = x;
            pending -= 1;
            if (pending === 0) {
              disposable.dispose();
              let r;
              try {
                r = zipper(result);
                if (typeof r === 'undefined') {
                  throw new Error('Single.zip: zipper function returned an undefined value.');
                }
              } catch (e) {
                onError(e);
                return;
              }
              onSuccess(r);
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
    } else if (typeof single !== 'undefined') {
      result[i] = single;
      pending -= 1;
    } else {
      disposable.dispose();
      onError('Single.zip: One of the sources is undefined.');
      break;
    }
  }
}
/**
 * @ignore
 */
const zip = (sources, zipper) => {
  if (!isIterable(sources)) {
    return error('Single.zip: sources is not Iterable.');
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
