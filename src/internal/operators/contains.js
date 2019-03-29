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
  if (typeof value === 'undefined') {
    return source;
  }

  let cmp = comparer;
  if (typeof cmp !== 'function') {
    cmp = containsComparer;
  }

  const single = new Single();
  single.source = source;
  single.value = value;
  single.comparer = cmp;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};
