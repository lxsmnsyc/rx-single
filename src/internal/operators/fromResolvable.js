import {
  cleanObserver, isFunction,
} from '../utils';
import Single from '../../single';
import error from './error';
import SingleEmitter from '../../single-emitter';

function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const emitter = new SingleEmitter(onSuccess, onError);

  onSubscribe(emitter);

  this.subscriber(
    x => emitter.onSuccess(x),
    x => emitter.onError(x),
  );
}
/**
 * @ignore
 */
export default (subscriber) => {
  if (!isFunction(subscriber)) {
    return error(new Error('Single.fromResolvable: expects a function.'));
  }
  const single = new Single(subscribeActual);
  single.subscriber = subscriber;
  return single;
};
