import { BooleanCancellable } from 'rx-cancellable';
import Single from '../../single';
import { cleanObserver } from '../utils';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const {
    source, cached, observers, subscribed,
  } = this;

  if (!cached) {
    const index = observers.length;
    observers[index] = observer;

    const controller = new BooleanCancellable();

    controller.addEventListener('cancel', () => {
      observers.splice(index, 1);
    });

    onSubscribe(controller);

    if (!subscribed) {
      source.subscribeWith({
        onSubscribe() {
          // not applicable
        },
        onSuccess: (x) => {
          this.cached = true;
          this.value = x;

          // eslint-disable-next-line no-restricted-syntax
          for (const obs of observers) {
            obs.onSuccess(x);
          }
          this.observers = undefined;
        },
        onError: (x) => {
          this.cached = true;
          this.error = x;

          // eslint-disable-next-line no-restricted-syntax
          for (const obs of observers) {
            obs.onError(x);
          }
          this.observers = undefined;
        },
      });
      this.subscribed = true;
    }
  } else {
    const controller = new BooleanCancellable();
    onSubscribe(controller);

    const { value, error } = this;
    if (value != null) {
      onSuccess(value);
    }
    if (error != null) {
      onError(error);
    }
    controller.cancel();
  }
}

/**
 * @ignore
 */
export default (source) => {
  const single = new Single(subscribeActual);
  single.source = source;
  single.cached = false;
  single.subscribed = false;
  single.observers = [];
  return single;
};
