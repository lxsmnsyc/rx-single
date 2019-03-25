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
        if (typeof result === 'undefined') {
          throw new Error('Single.map: mapper function returned an undefined value.');
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
const map = (source, mapper) => {
  let ms = mapper;
  if (typeof mapper !== 'function') {
    ms = defaultMapper;
  }

  const single = new Single();
  single.source = source;
  single.mapper = ms;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default map;
