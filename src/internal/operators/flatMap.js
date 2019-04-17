import { LinkedCancellable } from 'rx-cancellable';
import Single from '../../single';
import { cleanObserver, isFunction } from '../utils';
import is from '../is';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSubscribe, onError, onSuccess } = cleanObserver(observer);

  const controller = new LinkedCancellable();

  onSubscribe(controller);

  const { mapper, source } = this;

  source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onSuccess(x) {
      controller.unlink();
      let result;
      try {
        result = mapper(x);

        if (!is(result)) {
          throw new Error('Single.flatMap: mapper returned a non-Single');
        }
      } catch (e) {
        onError(e);
        controller.cancel();
        return;
      }
      result.subscribeWith({
        onSubscribe(ac) {
          controller.link(ac);
        },
        onSuccess,
        onError,
      });
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
