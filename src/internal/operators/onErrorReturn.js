import Single from '../../single';
import { cleanObserver } from '../utils';

function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { source, item } = this;

  source.subscribeWith({
    onSubscribe,
    onSuccess,
    onError(x) {
      let result;

      try {
        result = item(x);

        if (typeof result === 'undefined') {
          throw new Error(new Error('Single.onErrorReturn: returned an non-Single.'));
        }
      } catch (e) {
        onError([x, e]);
        return;
      }
      onSuccess(result);
    },
  });
}
/**
 * @ignore
 */
const onErrorReturn = (source, item) => {
  if (typeof item !== 'function') {
    return source;
  }

  const single = new Single();
  single.source = source;
  single.item = item;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default onErrorReturn;
