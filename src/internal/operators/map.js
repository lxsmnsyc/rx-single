import Single from '../../single';

/**
 * @ignore
 */
const defaultMapper = x => x;

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  const { mapper } = this;

  this.source.subscribeWith({
    onSubscribe,
    onSuccess(x) {
      let result;
      try {
        result = mapper(x);
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
