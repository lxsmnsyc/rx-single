import Single from '../../single';
import error from './error';
import { SimpleDisposable } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSubscribe, onError, onSuccess } = observer;

  const disposable = new SimpleDisposable();

  onSubscribe(disposable);

  this.source.subscribeWith({
    onSubscribe(d) {
      disposable.setDisposable(d);
    },
    onSuccess(x) {
      let result = x;
      if (!(x instanceof Single)) {
        result = error('Single.merge: source emitted a non-Single value.');
      }
      result.subscribeWith({
        onSubscribe(d) {
          disposable.setDisposable(d);
        },
        onSuccess,
        onError,
      });
    },
    onError,
  });
}

/**
 * @ignore
 */
const merge = (source) => {
  if (!(source instanceof Single)) {
    return error('Single.merge: source is not a Single.');
  }

  const single = new Single();
  single.source = source;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default merge;
