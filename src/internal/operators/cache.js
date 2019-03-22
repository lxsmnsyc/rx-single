import Single from '../../single';
import { SimpleDisposable } from '../utils';


function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  const {
    source, cached, observers, subscribed,
  } = this;

  if (!cached) {
    const index = observers.length;
    observers[index] = observer;

    onSubscribe(new SimpleDisposable(() => {
      observers.splice(index, 1);
    }));

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
    const disposable = new SimpleDisposable();
    onSubscribe(disposable);

    const { value, error } = this;
    if (typeof value !== 'undefined') {
      onSuccess(value);
    }
    if (typeof error !== 'undefined') {
      onError(value);
    }
    disposable.dispose();
  }
}

const cache = (source) => {
  const single = new Single();
  single.source = source;
  single.cached = false;
  single.subscribed = false;
  single.observers = [];
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default cache;
