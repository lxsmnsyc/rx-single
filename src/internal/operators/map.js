import Single from '../../single';
import { cleanObserver } from '../utils';

/**
 * @ignore
 */
const defaultMapper = x => x;

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
        if (result == null) {
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
  let ms = mapper;
  if (typeof mapper !== 'function') {
    ms = defaultMapper;
  }

  const single = new Single(subscribeActual);
  single.source = source;
  single.mapper = ms;
  return single;
};
