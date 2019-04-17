import Single from '../../single';
import { cleanObserver, isNull } from '../utils';

function subscribeActual(observer) {
  const { onSuccess, onSubscribe } = cleanObserver(observer);

  const { source, item } = this;

  source.subscribeWith({
    onSubscribe,
    onSuccess,
    onError() {
      onSuccess(item);
    },
  });
}
/**
 * @ignore
 */
export default (source, item) => {
  if (isNull(item)) {
    return source;
  }

  const single = new Single(subscribeActual);
  single.source = source;
  single.item = item;
  return single;
};
