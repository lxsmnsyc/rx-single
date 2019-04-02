import Single from '../../single';
import { cleanObserver } from '../utils';

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
  if (item == null) {
    return source;
  }

  const single = new Single();
  single.source = source;
  single.item = item;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};
