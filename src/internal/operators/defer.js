import Single from '../../single';
import { disposed } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  let result;

  let err;
  try {
    result = this.supplier();
    if (!(result instanceof Single)) {
      err = 'Single.defer: supplier returned a non-Single.';
    }
  } catch (e) {
    err = e;
  }

  if (typeof err !== 'undefined') {
    onSubscribe(disposed);
    onError(err);
  } else {
    result.subscribeWith({
      onSubscribe,
      onSuccess,
      onError,
    });
  }
}
/**
 * @ignore
 */
const defer = (supplier) => {
  const single = new Single();
  single.supplier = supplier;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default defer;
