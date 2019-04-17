import Single from '../../single';
import { cleanObserver, isFunction, isNull } from '../utils';
/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { mapper } = this;

  this.source.subscribeWith({
    onSubscribe,
    onSuccess(x) {
      let result;
      try {
        result = mapper(x);
        if (isNull(result)) {
          throw new Error('Single.map: mapper function returned a null value.');
        }
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
export default (source, mapper) => {
  if (!isFunction(mapper)) {
    return source;
  }
  const single = new Single(subscribeActual);
  single.source = source;
  single.mapper = mapper;
  return single;
};
