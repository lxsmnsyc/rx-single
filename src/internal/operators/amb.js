import Single from '../../single';
import { isIterable, CompositeDisposable, cleanObserver } from '../utils';
import { error } from '../operators';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const disposable = new CompositeDisposable();

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
          disposable.add(d);
        },
        // eslint-disable-next-line no-loop-func
        onSuccess(x) {
          onSuccess(x);
          disposable.dispose();
        },
        onError(x) {
          onError(x);
          disposable.dispose();
        },
      });
    } else {
      onError(new Error('Single.amb: One of the sources is a non-Single.'));
      disposable.dispose();
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
    return error(new Error('Single.amb: sources is not Iterable.'));
  }
  const single = new Single();
  single.sources = sources;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default amb;
