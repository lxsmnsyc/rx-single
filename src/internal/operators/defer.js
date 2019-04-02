import Single from '../../single';
import { immediateError, cleanObserver } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  let result;

  let err;
  try {
    result = this.supplier();
    if (!(result instanceof Single)) {
      throw new Error('Single.defer: supplier returned a non-Single.');
    }
  } catch (e) {
    err = e;
  }

  if (err != null) {
    immediateError(observer, err);
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
export default (supplier) => {
  const single = new Single();
  single.supplier = supplier;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};
