import AbortController from 'abort-controller';
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

    const controller = new AbortController();

    controller.signal.addEventListener('abort', () => {
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
    const controller = new AbortController();
    onSubscribe(controller);

    const { value, error } = this;
    if (typeof value !== 'undefined') {
      onSuccess(value);
    }
    if (typeof error !== 'undefined') {
      onError(error);
    }
    controller.abort();
  }
}

/**
 * @ignore
 */
export default (source) => {
  const single = new Single();
  single.source = source;
  single.cached = false;
  single.subscribed = false;
  single.observers = [];
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};
