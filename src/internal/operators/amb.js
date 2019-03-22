import Single from '../../single';
import { SimpleDisposable, isDisposable, isIterable } from '../utils';
import { error } from '../operators';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  const composite = [];

  const disposable = new SimpleDisposable(() => {
    // eslint-disable-next-line no-restricted-syntax
    for (const d of composite) {
      if (isDisposable(d)) {
        d.dispose();
      }
    }
  });

  onSubscribe(disposable);

  const { sources } = this;

  const size = sources.length;

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
    } else {
      disposable.dispose();
      onError('Single.zip: One of the sources is a non-Single.');
      break;
    }
  }
  onSubscribe(disposable);
}
/**
 * @ignore
 */
const amb = (sources) => {
  if (!isIterable(sources)) {
    return error('Single.amb: sources is not Iterable.');
  }
  const single = new Single();
  single.sources = sources;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default amb;
