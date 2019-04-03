import Single from '../../single';
import { cleanObserver } from '../utils';

/**
 * @ignore
 */
const containsComparer = (x, y) => x === y;

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { value, comparer } = this;

  this.source.subscribeWith({
    onSubscribe,
    onSuccess(x) {
      let result;
      try {
        result = comparer(x, value);
      } catch (e) {
        onError(e);
        return;
      }
      onSuccess(result);
    },
    onError,
  });
}
/**
 * @ignore
 */
export default (source, value, comparer) => {
  if (value == null) {
    return source;
  }

  let cmp = comparer;
  if (typeof cmp !== 'function') {
    cmp = containsComparer;
  }

  const single = new Single(subscribeActual);
  single.source = source;
  single.value = value;
  single.comparer = cmp;
  return single;
};
