var Single = (function () {
  'use strict';

  /**
   * @ignore
   */
  const DISPOSED = Symbol('DISPOSED');
  /**
   * @ignore
   */
  const isDisposable = obj => typeof obj === 'object' && (typeof obj.dispose === 'function' && typeof obj.isDisposed === 'function');
  /**
   * @ignore
   */
  const isIterable = obj => typeof obj === 'object' && typeof obj[Symbol.iterator] === 'function';
  /**
   * @ignore
   */
  const isObserver = obj => typeof obj === 'object' && typeof obj.onSubscribe === 'function';
  /**
   * @ignore
   */
  const neverDisposed = {
    dispose: () => {},
    isDisposed: () => false,
  };
  /**
   * @ignore
   */
  const toCallable = x => () => x;
  /**
   * @ignore
   */
  const isPromise = obj => (obj instanceof Promise) || (!!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function');
  /**
   * @ignore
   */
  function onSuccessHandler(value) {
    if (this.disposable.isDisposed()) {
      return;
    }
    try {
      if (typeof value === 'undefined') {
        this.onError('onSuccess called with undefined.');
      } else {
        this.onSuccess(value);
      }
    } finally {
      this.disposable.dispose();
    }
  }
  /**
   * @ignore
   */
  function onErrorHandler(err) {
    let report = err;
    if (typeof err === 'undefined') {
      report = 'onError called with undefined value.';
    }
    if (this.disposable.isDisposed()) {
      return;
    }

    try {
      this.onError(report);
    } finally {
      this.disposable.dispose();
    }
  }
  /**
   * @ignore
   */
  class SimpleDisposable {
    constructor(onDispose) {
      this.state = false;
      this.onDispose = onDispose;
    }

    setDisposable(disposable) {
      if (isDisposable(disposable)) {
        if (this.state === DISPOSED) {
          disposable.dispose();
        } else {
          this.state = disposable;
        }
      }
    }

    fire() {
      const { onDispose } = this;
      this.state = DISPOSED;
      if (typeof onDispose === 'function') {
        onDispose();
      }
      this.onDispose = undefined;
    }

    dispose() {
      const { state } = this;

      if (state === DISPOSED) {
        return;
      }

      if (isDisposable(state)) {
        if (!state.isDisposed()) {
          this.state.dispose();
        }
        if (state.isDisposed()) {
          this.fire();
        }
      } else {
        this.fire();
      }
    }

    isDisposed() {
      const { state } = this;
      if (isDisposable(state)) {
        if (state.isDisposed()) {
          this.fire();
          return true;
        }
        return false;
      }
      return state === DISPOSED;
    }
  }

  /**
   * @ignore
   */
  class CompositeDisposable {
    constructor() {
      this.set = [];
      this.disposed = false;
    }

    add(d) {
      if (isDisposable(d)) {
        if (this.disposed) {
          d.dispose();
        } else {
          this.set.push(d);
        }
      }
    }

    dispose() {
      if (!this.disposed) {
        // eslint-disable-next-line no-restricted-syntax
        for (const d of this.set) {
          d.dispose();
        }
        this.set = undefined;
        this.disposed = DISPOSED;
      }
    }

    isDisposed() {
      return this.disposed === DISPOSED;
    }
  }
  /**
   * @ignore
   */
  const immediateSuccess = (o, x) => {
    const disposable = new SimpleDisposable();
    o.onSubscribe(disposable);

    if (!disposable.isDisposed()) {
      o.onSuccess(x);
      disposable.dispose();
    }
  };
  /**
   * @ignore
   */
  const immediateError = (o, x) => {
    const disposable = new SimpleDisposable();
    o.onSubscribe(disposable);

    if (!disposable.isDisposed()) {
      o.onError(x);
      disposable.dispose();
    }
  };

  /**
   * @ignore
   */
  function subscribeActual(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

    const disposable = new CompositeDisposable();

    onSubscribe(disposable);

    const { sources } = this;

    const size = sources.length;

    for (let i = 0; i < size; i += 1) {
      if (disposable.isDisposed()) {
        return;
      }
      const single = sources[i];

      if (single instanceof Single) {
        single.subscribeWith({
          onSubscribe(d) {
            disposable.add(d);
          },
          // eslint-disable-next-line no-loop-func
          onSuccess(x) {
            onSuccess(x);
            disposable.dispose();
          },
          onError(x) {
            onError(x);
            disposable.dispose();
          },
        });
      } else {
        onError('Single.zip: One of the sources is a non-Single.');
        disposable.dispose();
        break;
      }
    }
    onSubscribe(disposable);
  }
  /**
   * @ignore
   */
  const amb = (sources) => {
    if (!isIterable(sources)) {
      return error('Single.amb: sources is not Iterable.');
    }
    const single = new Single();
    single.sources = sources;
    single.subscribeActual = subscribeActual.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$1(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

    const disposable = new CompositeDisposable();

    onSubscribe(disposable);

    const { source, other } = this;

    source.subscribeWith({
      onSubscribe(d) {
        disposable.add(d);
      },
      onSuccess(x) {
        onSuccess(x);
        disposable.dispose();
      },
      onError(x) {
        onError(x);
        disposable.dispose();
      },
    });
    other.subscribeWith({
      onSubscribe(d) {
        disposable.add(d);
      },
      onSuccess(x) {
        onSuccess(x);
        disposable.dispose();
      },
      onError(x) {
        onError(x);
        disposable.dispose();
      },
    });
  }
  /**
   * @ignore
   */
  const ambWith = (source, other) => {
    if (!(other instanceof Single)) {
      return source;
    }
    const single = new Single();
    single.source = source;
    single.other = other;
    single.subscribeActual = subscribeActual$1.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$2(observer) {
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

  /**
   * @ignore
   */
  const cache = (source) => {
    const single = new Single();
    single.source = source;
    single.cached = false;
    single.subscribed = false;
    single.observers = [];
    single.subscribeActual = subscribeActual$2.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$3(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

    const emitter = new SimpleDisposable();
    emitter.onSuccess = onSuccessHandler.bind(this);
    emitter.onError = onErrorHandler.bind(this);

    this.disposable = emitter;
    this.onSuccess = onSuccess;
    this.onError = onError;

    onSubscribe(emitter);
    try {
      this.subscriber(emitter);
    } catch (ex) {
      emitter.onError(ex);
    }
  }
  /**
   * @ignore
   */
  const create = (subscriber) => {
    if (typeof subscriber !== 'function') {
      return error('Single.create: There are no subscribers.');
    }
    const single = new Single();
    single.subscriber = subscriber;
    single.subscribeActual = subscribeActual$3.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  const compose = (source, transformer) => {
    if (typeof transformer !== 'function') {
      return source;
    }

    let result;

    try {
      result = transformer(source);

      if (!(result instanceof Single)) {
        throw new Error('Single.compose: transformer returned a non-Single.');
      }
    } catch (e) {
      result = error(e);
    }

    return result;
  };

  /**
   * @ignore
   */
  const containsComparer = (x, y) => x === y;

  /**
   * @ignore
   */
  function subscribeActual$4(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

    const { value, comparer } = this;

    this.source.subscribeWith({
      onSubscribe,
      onSuccess(x) {
        let result;
        try {
          result = comparer(x, value);
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
  const contains = (source, value, comparer) => {
    if (typeof value === 'undefined') {
      return source;
    }

    let cmp = comparer;
    if (typeof cmp !== 'function') {
      cmp = containsComparer;
    }

    const single = new Single();
    single.source = source;
    single.value = value;
    single.comparer = cmp;
    single.subscribeActual = subscribeActual$4.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$5(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

    let result;

    let err;
    try {
      result = this.supplier();
      if (!(result instanceof Single)) {
        err = 'Single.defer: supplier returned a non-Single.';
      }
    } catch (e) {
      err = e;
    }

    if (typeof err !== 'undefined') {
      immediateError(observer, err);
    } else {
      result.subscribeWith({
        onSubscribe,
        onSuccess,
        onError,
      });
    }
  }
  /**
   * @ignore
   */
  const defer = (supplier) => {
    const single = new Single();
    single.supplier = supplier;
    single.subscribeActual = subscribeActual$5.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$6(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

    let timeout;

    const disposable = new SimpleDisposable(() => {
      if (typeof timeout !== 'undefined') {
        clearTimeout(timeout);
      }
    });

    const { amount, doDelayError } = this;

    onSubscribe(disposable);

    this.source.subscribeWith({
      onSubscribe(d) {
        disposable.setDisposable(d);
      },
      onSuccess(x) {
        timeout = setTimeout(() => {
          onSuccess(x);
          disposable.dispose();
        }, amount);
      },
      onError(x) {
        timeout = setTimeout(() => {
          onError(x);
          disposable.dispose();
        }, doDelayError ? amount : 0);
      },
    });
  }
  /**
   * @ignore
   */
  const delay = (source, amount, doDelayError) => {
    if (typeof amount !== 'number') {
      return source;
    }
    const single = new Single();
    single.source = source;
    single.amount = amount;
    single.doDelayError = doDelayError;
    single.subscribeActual = subscribeActual$6.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$7(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

    const { amount } = this;

    let timeout;

    const disposable = new SimpleDisposable(() => {
      if (typeof timeout !== 'undefined') {
        clearTimeout(timeout);
      }
    });

    onSubscribe(disposable);

    timeout = setTimeout(() => {
      this.source.subscribeWith({
        onSubscribe(d) {
          disposable.setDisposable(d);
        },
        onSuccess(x) {
          onSuccess(x);
          disposable.dispose();
        },
        onError(x) {
          onError(x);
          disposable.dispose();
        },
      });
    }, amount);
  }
  /**
   * @ignore
   */
  const delaySubscription = (source, amount) => {
    if (typeof amount !== 'number') {
      return source;
    }
    const single = new Single();
    single.source = source;
    single.amount = amount;
    single.subscribeActual = subscribeActual$7.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$8(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

    const { source, other } = this;

    const disposable = new SimpleDisposable();

    onSubscribe(disposable);

    other.subscribeWith({
      onSubscribe(d) {
        disposable.setDisposable(d);
      },
      onSuccess() {
        if (!disposable.isDisposed()) {
          source.subscribeWith({
            onSubscribe(d) {
              disposable.setDisposable(d);
            },
            onSuccess(x) {
              onSuccess(x);
              disposable.dispose();
            },
            onError(x) {
              onError(x);
              disposable.dispose();
            },
          });
        }
      },
      onError(x) {
        onError(x);
        disposable.dispose();
      },
    });
  }
  /**
   * @ignore
   */
  const delayUntil = (source, other) => {
    if (!(other instanceof Single)) {
      return source;
    }
    const single = new Single();
    single.source = source;
    single.other = other;
    single.subscribeActual = subscribeActual$8.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$9(observer) {
    const { onSubscribe, onSuccess, onError } = observer;

    const { source, callable } = this;

    source.subscribeWith({
      onSubscribe,
      onSuccess(x) {
        onSuccess(x);
        callable(x);
      },
      onError,
    });
  }

  /**
   * @ignore
   */
  const doAfterSuccess = (source, callable) => {
    if (typeof callable !== 'function') {
      return source;
    }

    const single = new Single();
    single.source = source;
    single.callable = callable;
    single.subscribeActual = subscribeActual$9.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$a(observer) {
    const { onSubscribe, onSuccess, onError } = observer;

    const { source, callable } = this;

    source.subscribeWith({
      onSubscribe,
      onSuccess(x) {
        onSuccess(x);
        callable();
      },
      onError(x) {
        onError(x);
        callable();
      },
    });
  }

  /**
   * @ignore
   */
  const doAfterTerminate = (source, callable) => {
    if (typeof callable !== 'function') {
      return source;
    }

    const single = new Single();
    single.source = source;
    single.callable = callable;
    single.subscribeActual = subscribeActual$a.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$b(observer) {
    const { onSubscribe, onSuccess, onError } = observer;

    const { source, callable } = this;

    let called = false;
    const disposable = new SimpleDisposable(() => {
      if (!called) {
        callable();
        called = true;
      }
    });

    source.subscribeWith({
      onSubscribe(d) {
        disposable.setDisposable(d);
        onSubscribe(disposable);
      },
      onSuccess(x) {
        onSuccess(x);
        if (!called) {
          callable();
          called = true;
        }
      },
      onError(x) {
        onError(x);
        if (!called) {
          callable();
          called = true;
        }
      },
    });
  }

  /**
   * @ignore
   */
  const doAfterTerminate$1 = (source, callable) => {
    if (typeof callable !== 'function') {
      return source;
    }

    const single = new Single();
    single.source = source;
    single.callable = callable;
    single.subscribeActual = subscribeActual$b.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$c(observer) {
    const { onSubscribe, onSuccess, onError } = observer;

    const { source, callable } = this;

    const disposable = new SimpleDisposable(callable);

    onSubscribe(disposable);

    source.subscribeWith({
      onSubscribe(d) {
        disposable.setDisposable(d);
      },
      onSuccess(x) {
        onSuccess(x);
        disposable.dispose();
      },
      onError(x) {
        onError(x);
        disposable.dispose();
      },
    });
  }

  /**
   * @ignore
   */
  const doOnDispose = (source, callable) => {
    if (typeof callable !== 'function') {
      return source;
    }

    const single = new Single();
    single.source = source;
    single.callable = callable;
    single.subscribeActual = subscribeActual$c.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$d(observer) {
    const { onSubscribe, onSuccess, onError } = observer;

    const { source, callable } = this;

    source.subscribeWith({
      onSubscribe,
      onSuccess,
      onError(x) {
        callable(x);
        onError(x);
      },
    });
  }

  /**
   * @ignore
   */
  const doOnError = (source, callable) => {
    if (typeof callable !== 'function') {
      return source;
    }

    const single = new Single();
    single.source = source;
    single.callable = callable;
    single.subscribeActual = subscribeActual$d.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$e(observer) {
    const { onSubscribe, onSuccess, onError } = observer;

    const { source, callable } = this;

    source.subscribeWith({
      onSubscribe,
      onSuccess(x) {
        callable(x);
        onSuccess(x);
      },
      onError(x) {
        callable(undefined, x);
        onError(x);
      },
    });
  }

  /**
   * @ignore
   */
  const doOnEvent = (source, callable) => {
    if (typeof callable !== 'function') {
      return source;
    }

    const single = new Single();
    single.source = source;
    single.callable = callable;
    single.subscribeActual = subscribeActual$e.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$f(observer) {
    const { onSubscribe, onSuccess, onError } = observer;

    const { source, callable } = this;

    source.subscribeWith({
      onSubscribe,
      onSuccess(x) {
        callable(x);
        onSuccess(x);
      },
      onError,
    });
  }

  /**
   * @ignore
   */
  const doOnSuccess = (source, callable) => {
    if (typeof callable !== 'function') {
      return source;
    }

    const single = new Single();
    single.source = source;
    single.callable = callable;
    single.subscribeActual = subscribeActual$f.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$g(observer) {
    const { onSubscribe, onSuccess, onError } = observer;

    const { source, callable } = this;

    source.subscribeWith({
      onSubscribe(d) {
        callable(d);
        onSubscribe(d);
      },
      onSuccess,
      onError,
    });
  }

  /**
   * @ignore
   */
  const doOnSubscribe = (source, callable) => {
    if (typeof callable !== 'function') {
      return source;
    }
    const single = new Single();
    single.source = source;
    single.callable = callable;
    single.subscribeActual = subscribeActual$g.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$h(observer) {
    const { onSubscribe, onSuccess, onError } = observer;

    const { source, callable } = this;

    source.subscribeWith({
      onSubscribe,
      onSuccess(x) {
        callable();
        onSuccess(x);
      },
      onError(x) {
        callable();
        onError(x);
      },
    });
  }

  /**
   * @ignore
   */
  const doOnTerminate = (source, callable) => {
    if (typeof callable !== 'function') {
      return source;
    }

    const single = new Single();
    single.source = source;
    single.callable = callable;
    single.subscribeActual = subscribeActual$h.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$i(observer) {
    let err;

    try {
      err = this.supplier();

      if (typeof err === 'undefined') {
        err = 'Single.error: Error supplier returned an undefined value.';
      }
    } catch (e) {
      err = e;
    }
    immediateError(observer, err);
  }
  /**
   * @ignore
   */
  const error = (value) => {
    let report = value;
    if (typeof value === 'undefined') {
      report = 'Single.error received an undefined value.';
    }

    if (typeof value !== 'function') {
      report = toCallable(report);
    }
    const single = new Single();
    single.supplier = report;
    single.subscribeActual = subscribeActual$i.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$j(observer) {
    const { onSubscribe, onError, onSuccess } = observer;

    const disposable = new SimpleDisposable();

    onSubscribe(disposable);

    const { mapper, source } = this;

    source.subscribeWith({
      onSubscribe(d) {
        disposable.setDisposable(d);
      },
      onSuccess(x) {
        let result;
        try {
          result = mapper(x);

          if (!(result instanceof Single)) {
            throw new Error('Single.flatMap: mapper returned a non-Single');
          }
        } catch (e) {
          onError(e);
          return;
        }
        result.subscribeWith({
          onSubscribe(d) {
            disposable.setDisposable(d);
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
  const flatMap = (source, mapper) => {
    if (typeof mapper !== 'function') {
      return source;
    }

    const single = new Single();
    single.source = source;
    single.mapper = mapper;
    single.subscribeActual = subscribeActual$j.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$k(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

    const disposable = new SimpleDisposable();

    onSubscribe(disposable);

    this.disposable = disposable;
    this.onSuccess = onSuccess;
    this.onError = onError;

    const resolve = onSuccessHandler.bind(this);
    const reject = onErrorHandler.bind(this);

    let result;
    try {
      result = this.callable();
    } catch (e) {
      reject(e);
      return;
    }

    if (isPromise(result)) {
      fromPromise(result).subscribe(onSuccess, onError);
    } else {
      resolve(result);
    }
  }
  /**
   * @ignore
   */
  const fromCallable = (callable) => {
    if (typeof callable !== 'function') {
      return error('Single.fromCallable: callable received is not a function.');
    }
    const single = new Single();
    single.callable = callable;
    single.subscribeActual = subscribeActual$k.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$l(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

    const disposable = new SimpleDisposable();

    onSubscribe(disposable);

    this.disposable = disposable;
    this.onSuccess = onSuccess;
    this.onError = onError;

    this.promise.then(
      onSuccessHandler.bind(this),
      onErrorHandler.bind(this),
    );
  }
  /**
   * @ignore
   */
  const fromPromise = (promise) => {
    if (!isPromise(promise)) {
      return error('Single.fromPromise: expects a Promise-like value.');
    }
    const single = new Single();
    single.promise = promise;
    single.subscribeActual = subscribeActual$l.bind(single);
    return single;
  };

  function subscribeActual$m(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

    const disposable = new SimpleDisposable();

    onSubscribe(disposable);

    this.disposable = disposable;
    this.onSuccess = onSuccess;
    this.onError = onError;

    const resolve = onSuccessHandler.bind(this);
    const reject = onErrorHandler.bind(this);

    this.subscriber(resolve, reject);
  }
  /**
   * @ignore
   */
  const fromResolvable = (subscriber) => {
    if (typeof subscriber !== 'function') {
      return error('Single.fromResolvable: There are no subscribers.');
    }
    const single = new Single();
    single.subscriber = subscriber;
    single.subscribeActual = subscribeActual$m.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$n(observer) {
    immediateSuccess(observer, this.value);
  }
  /**
   * @ignore
   */
  const just = (value) => {
    if (typeof value === 'undefined') {
      return error('Single.just: received an undefined value.');
    }
    const single = new Single();
    single.value = value;
    single.subscribeActual = subscribeActual$n.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$o(observer) {
    let result;

    try {
      result = this.operator(observer);

      if (!isObserver(result)) {
        throw new Error('Single.lift: operator returned a non-Observer.');
      }
    } catch (e) {
      immediateError(observer, e);
      return;
    }

    this.source.subscribeWith(result);
  }

  /**
   * @ignore
   */
  const lift = (source, operator) => {
    if (typeof operator !== 'function') {
      return source;
    }

    const single = new Single();
    single.source = source;
    single.operator = operator;
    single.subscribeActual = subscribeActual$o.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  const defaultMapper = x => x;

  /**
   * @ignore
   */
  function subscribeActual$p(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

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
    single.subscribeActual = subscribeActual$p.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$q(observer) {
    const { onSubscribe, onError, onSuccess } = observer;

    const disposable = new SimpleDisposable();

    onSubscribe(disposable);

    this.source.subscribeWith({
      onSubscribe(d) {
        disposable.setDisposable(d);
      },
      onSuccess(x) {
        let result = x;
        if (!(x instanceof Single)) {
          result = error('Single.merge: source emitted a non-Single value.');
        }
        result.subscribeWith({
          onSubscribe(d) {
            disposable.setDisposable(d);
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
  const merge = (source) => {
    if (!(source instanceof Single)) {
      return error('Single.merge: source is not a Single.');
    }

    const single = new Single();
    single.source = source;
    single.subscribeActual = subscribeActual$q.bind(single);
    return single;
  };

  function subscribeActual$r(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

    const { source, resumeIfError } = this;

    const disposable = new SimpleDisposable();

    onSubscribe(disposable);

    source.subscribeWith({
      onSubscribe(d) {
        disposable.setDisposable(d);
      },
      onSuccess,
      onError(x) {
        let result;

        if (typeof resumeIfError === 'function') {
          try {
            result = resumeIfError(x);
            if (typeof result === 'undefined') {
              throw new Error('Single.onErrorResumeNext: returned an non-Single.');
            }
          } catch (e) {
            onError([x, e]);
            return;
          }
        } else {
          result = resumeIfError;
        }

        result.subscribeWith({
          onSubscribe(d) {
            disposable.setDisposable(d);
          },
          onSuccess,
          onError,
        });
      },
    });
  }
  /**
   * @ignore
   */
  const onErrorResumeNext = (source, resumeIfError) => {
    if (!(typeof resumeIfError === 'function' || resumeIfError instanceof Single)) {
      return source;
    }

    const single = new Single();
    single.source = source;
    single.resumeIfError = resumeIfError;
    single.subscribeActual = subscribeActual$r.bind(single);
    return single;
  };

  function subscribeActual$s(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

    const { source, item } = this;

    source.subscribeWith({
      onSubscribe,
      onSuccess,
      onError(x) {
        let result;

        try {
          result = item(x);

          if (typeof result === 'undefined') {
            throw new Error('Single.onErrorReturn: returned an non-Single.');
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
    single.subscribeActual = subscribeActual$s.bind(single);
    return single;
  };

  function subscribeActual$t(observer) {
    const { onSuccess, onSubscribe } = observer;

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
  const onErrorReturnItem = (source, item) => {
    if (typeof item === 'undefined') {
      return source;
    }

    const single = new Single();
    single.source = source;
    single.item = item;
    single.subscribeActual = subscribeActual$t.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$u(observer) {
    observer.onSubscribe(neverDisposed);
  }
  /**
   * @ignore
   */
  let INSTANCE;
  /**
   * @ignore
   */
  const never = () => {
    if (typeof INSTANCE === 'undefined') {
      INSTANCE = new Single();
      INSTANCE.subscribeActual = subscribeActual$u.bind(INSTANCE);
    }
    return INSTANCE;
  };

  /**
   * @ignore
   */
  function subscribeActual$v(observer) {
    const { onSubscribe, onSuccess, onError } = observer;

    const disposable = new SimpleDisposable();

    onSubscribe(disposable);

    const { source, bipredicate } = this;

    let retries = 0;

    const sub = () => {
      if (!disposable.isDisposed()) {
        retries += 1;

        source.subscribeWith({
          onSubscribe(d) {
            disposable.setDisposable(d);
          },
          onSuccess,
          onError(x) {
            if (typeof bipredicate === 'function') {
              const result = bipredicate(retries, x);

              if (result) {
                sub();
              } else {
                onError(x);
              }
            } else {
              sub();
            }
          },
        });
      }
    };

    sub();
  }

  /**
   * @ignore
   */
  const retry = (source, bipredicate) => {
    const single = new Single();
    single.source = source;
    single.bipredicate = bipredicate;
    single.subscribeActual = subscribeActual$v.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$w(observer) {
    const { onSubscribe, onSuccess, onError } = observer;

    const disposable = new CompositeDisposable();

    onSubscribe(disposable);

    const { source, other } = this;

    if (!disposable.isDisposed()) {
      other.subscribeWith({
        onSubscribe(d) {
          disposable.add(d);
        },
        onSuccess() {
          onError('Single.takeUntil: Source cancelled by other Single.');
          disposable.dispose();
        },
        onError(x) {
          onError(['Single.takeUntil: Source cancelled by other Single.', x]);
          disposable.dispose();
        },
      });

      source.subscribeWith({
        onSubscribe(d) {
          disposable.add(d);
        },
        onSuccess(x) {
          onSuccess(x);
          disposable.dispose();
        },
        onError(x) {
          onError(x);
          disposable.dispose();
        },
      });
    }
  }

  /**
   * @ignore
   */
  const takeUntil = (source, other) => {
    if (!(other instanceof Single)) {
      return source;
    }

    const single = new Single();
    single.source = source;
    single.other = other;
    single.subscribeActual = subscribeActual$w.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$x(observer) {
    const { onSuccess, onSubscribe } = observer;

    let timeout;

    const disposable = new SimpleDisposable(() => {
      if (typeof timeout !== 'undefined') {
        clearTimeout(timeout);
      }
    });

    onSubscribe(disposable);

    if (!disposable.isDisposed()) {
      timeout = setTimeout(() => {
        onSuccess(0);
        disposable.dispose();
      }, this.amount);
    }
  }
  /**
   * @ignore
   */
  const timer = (amount) => {
    if (typeof amount !== 'number') {
      return error('Single.timer: "amount" is not a number.');
    }
    const single = new Single();
    single.amount = amount;
    single.subscribeActual = subscribeActual$x.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  function subscribeActual$y(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

    const { amount } = this;

    let timeout;

    const disposable = new SimpleDisposable(() => {
      clearTimeout(timeout);
    });

    const err = (x) => {
      onError(x);
      disposable.dispose();
    };

    timeout = setTimeout(
      err,
      amount,
      'Single.timeout: TimeoutException (no success signals within the specified timeout).',
    );

    onSubscribe(disposable);

    this.source.subscribeWith({
      onSubscribe(d) {
        disposable.setDisposable(d);
      },
      onSuccess(x) {
        onSuccess(x);
        disposable.dispose();
      },
      onError: err,
    });
  }
  /**
   * @ignore
   */
  const timeout = (source, amount) => {
    if (typeof amount !== 'number') {
      return source;
    }
    const single = new Single();
    single.source = source;
    single.amount = amount;
    single.subscribeActual = subscribeActual$y.bind(single);
    return single;
  };

  const defaultZipper = x => x;
  /**
   * @ignore
   */
  function subscribeActual$z(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

    const result = [];

    const disposable = new CompositeDisposable();

    onSubscribe(disposable);

    const { sources, zipper } = this;

    const size = sources.length;

    if (size === 0) {
      onError('Single.zip: empty iterable');
      disposable.dispose();
      return;
    }
    let pending = size;

    for (let i = 0; i < size; i += 1) {
      if (disposable.isDisposed()) {
        return;
      }
      const single = sources[i];

      if (single instanceof Single) {
        single.subscribeWith({
          onSubscribe(d) {
            disposable.add(d);
          },
          // eslint-disable-next-line no-loop-func
          onSuccess(x) {
            if (!disposable.isDisposed()) {
              result[i] = x;
              pending -= 1;
              if (pending === 0) {
                let r;
                try {
                  r = zipper(result);
                  if (typeof r === 'undefined') {
                    throw new Error('Single.zip: zipper function returned an undefined value.');
                  }
                } catch (e) {
                  onError(e);
                  disposable.dispose();
                  return;
                }
                onSuccess(r);
                disposable.dispose();
              }
            }
          },
          onError(x) {
            if (!disposable.isDisposed()) {
              onError(x);
              disposable.dispose();
            }
          },
        });
      } else if (typeof single !== 'undefined') {
        result[i] = single;
        pending -= 1;
      } else {
        onError('Single.zip: One of the sources is undefined.');
        disposable.dispose();
        break;
      }
    }
  }
  /**
   * @ignore
   */
  const zip = (sources, zipper) => {
    if (!isIterable(sources)) {
      return error('Single.zip: sources is not Iterable.');
    }
    let fn = zipper;
    if (typeof zipper !== 'function') {
      fn = defaultZipper;
    }
    const single = new Single();
    single.sources = sources;
    single.zipper = fn;
    single.subscribeActual = subscribeActual$z.bind(single);
    return single;
  };

  /**
   * @ignore
   */
  const defaultZipper$1 = (x, y) => [x, y];
  /**
   * @ignore
   */
  function subscribeActual$A(observer) {
    const { onSuccess, onError, onSubscribe } = observer;

    let SA;
    let SB;

    const disposable = new CompositeDisposable();

    onSubscribe(disposable);

    const { source, other, zipper } = this;

    source.subscribeWith({
      onSubscribe(d) {
        disposable.add(d);
      },
      onSuccess(x) {
        if (!disposable.isDisposed()) {
          SA = x;

          if (typeof SB !== 'undefined') {
            let result;

            try {
              result = zipper(SA, SB);

              if (typeof result === 'undefined') {
                throw new Error('Single.zipWith: zipper function returned an undefined value.');
              }
            } catch (e) {
              onError(e);
              disposable.dispose();
              return;
            }
            onSuccess(result);
            disposable.dispose();
          }
        }
      },
      onError(x) {
        if (!disposable.isDisposed()) {
          onError(x);
          disposable.dispose();
        }
      },
    });

    other.subscribeWith({
      onSubscribe(d) {
        disposable.add(d);
      },
      onSuccess(x) {
        if (!disposable.isDisposed()) {
          SB = x;

          if (typeof SA !== 'undefined') {
            let result;

            try {
              result = zipper(SA, SB);

              if (typeof result === 'undefined') {
                throw new Error('Single.zipWith: zipper function returned an undefined value.');
              }
            } catch (e) {
              onError(e);
              disposable.dispose();
              return;
            }
            onSuccess(result);
            disposable.dispose();
          }
        }
      },
      onError(x) {
        if (!disposable.isDisposed()) {
          onError(x);
          disposable.dispose();
        }
      },
    });
  }
  /**
   * @ignore
   */
  const zipWith = (source, other, zipper) => {
    if (!(other instanceof Single)) {
      return source;
    }
    let fn = zipper;
    if (typeof zipper !== 'function') {
      fn = defaultZipper$1;
    }
    const single = new Single();
    single.source = source;
    single.other = other;
    single.zipper = fn;
    single.subscribeActual = subscribeActual$A.bind(single);
    return single;
  };

  /* eslint-disable import/no-cycle */

  /**
   * @license
   * MIT License
   *
   * Copyright (c) 2019 Alexis Munsayac
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   *
   *
   * @author Alexis Munsayac <alexis.munsayac@gmail.com>
   * @copyright Alexis Munsayac 2019
   */

  /**
   * The Single class implements the Reactive Pattern
   * for a single value response.
   *
   * Single behaves similarly to Observable except that
   * it can only emit either a single successful value
   * or an error (there is no "onComplete" notification
   * as there is for an Observable).
   *
   * The Single class default consumer type it interacts
   * with is the Observer via the subscribeWith(Observer)
   * or the subscribe(onSuccess, onError) method.
   *
   * The Single operates with the following sequential protocol:
   * <code>onSubscribe (onSuccess | onError)?</code>
   *
   * Note that onSuccess and onError are mutually exclusive
   * events; unlike Observable, onSuccess is never followed
   * by onError.
   *
   * Like Observable, a running Single can be stopped through
   * the Disposable instance provided to consumers through
   * Observer.onSubscribe(Disposable).
   *
   * Singles are cold by default, but using a toPromise method,
   * you can achieve a hot-like Single.
   *
   * The documentation for this class makes use of marble diagrams.
   * The following legend explains these diagrams:
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.legend.png" class="diagram">
   */
  class Single {
    /**
     * Provides an API (via a cold Single) that bridges
     * the reactive world with the callback-style world.
     *
     * This subscriber is a function that receives
     * an object that implements the Emitter interface.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.create.png" class="diagram">
     *
     * @example
     * const single = Single.create(e => e.onSuccess('Hello World'));
     * @param {!function(e: Emitter):any} subscriber
     * A function that accepts the Emitter interface.
     * @returns {Single}
     */
    static create(subscriber) {
      return create(subscriber);
    }

    /**
     * Runs multiple SingleSources and signals the events of
     * the first one that signals (disposing the rest).
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.amb.png" class="diagram">
     *
     * @param {!Iterable} sources
     * the Iterable sequence of sources. A subscription
     * to each source will occur in the same order as in
     * this Iterable.
     * @returns {Single}
     */
    static amb(sources) {
      return amb(sources);
    }

    /**
     * Signals the event of this or the other Single whichever
     * signals first.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.ambWith.png" class="diagram">
     *
     * @param {!Single} other
     * the other Single to race for the first emission
     * of success or error.
     * @returns {Single}
     * A subscription to this provided source will occur
     * after subscribing to the current source.
     */
    ambWith(other) {
      return ambWith(this, other);
    }

    /**
     * Stores the success value or exception from the
     * current Single and replays it to late Observers.
     *
     * The returned Single subscribes to the current Single
     * when the first SingleObserver subscribes.
     *
     * @returns {Single}
     */
    cache() {
      return cache(this);
    }

    /**
     * Transform a Single by applying a particular Transformer
     * function to it.
     *
     * This method operates on the Single itself whereas #lift
     * operates on the Single's Observers.
     *
     * If the operator you are creating is designed to act on
     * the individual item emitted by a Single, use lift.
     *
     * If your operator is designed to transform the source Single
     * as a whole (for instance, by applying a particular set of
     * existing operators to it) use compose.
     *
     * @param {!function(source: Single):Single} transformer
     * @returns {Single}
     * the source Single, transformed by the transformer function
     */
    compose(transformer) {
      return compose(this, transformer);
    }

    /**
     * Signals true if the current Single signals a success
     * value that is equal or if the comparer returns true
     * with the value provided.
     *
     * @param {!any} value
     * the value to compare against the success value of this Single.
     * @param {?function(x: any, successValue: any):any} comparer
     * the function that receives the success value of
     * this Single, the value provided and should return
     * true if they are considered equal.
     * @returns {Single}
     */
    contains(value, comparer) {
      return contains(this, value, comparer);
    }

    /**
     * Calls a function for each individual Observer
     * to return the actual Single to be subscribed to.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.defer.png" class="diagram">
     *
     * @param {!function():any} callable
     * the Callable that is called for each individual
     * Observer and returns a Single instance to subscribe to.
     * @returns {Single}
     */
    static defer(callable) {
      return defer(callable);
    }

    /**
     * Delays the emission of the success signal from
     * the current Single by the specified amount.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.delay.e.png" class="diagram">
     *
     * @param {!Number} amount
     * the amount of time the success signal should be
     * delayed for (in milliseconds).
     * @param {?Boolean} doDelayError
     * if true, both success and error signals are delayed.
     * if false, only success signals are delayed.
     * @returns {Single}
     */
    delay(amount, doDelayError) {
      return delay(this, amount, doDelayError);
    }

    /**
     * Delays the actual subscription to the current
     * Single until the given time delay elapsed.
     *
     * @param {!Number} amount
     * the time amount to wait with the subscription
     * (in milliseconds).
     * @returns {Single}
     */
    delaySubscription(amount) {
      return delaySubscription(this, amount);
    }

    /**
     * Delays the actual subscription to the current Single
     * until the given other SingleSource signals success.
     *
     * If the delaying source signals an error, that error is
     * re-emitted and no subscription to the current Single
     * happens.
     *
     * @param {!Single} other
     * the Single that has to complete before the subscription
     * to the current Single happens.
     * @returns {Single}
     */
    delayUntil(other) {
      return delayUntil(this, other);
    }

    /**
     * Calls the specified callable with the success
     * item after this item has been emitted to the
     * downstream.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doAfterSuccess.png" class="diagram">
     *
     * @param {!function(x: any)} callable
     * the function that will be called after emitting
     * an item from upstream to the downstream
     * @returns {Single}
     */
    doAfterSuccess(callable) {
      return doAfterSuccess(this, callable);
    }

    /**
     * Registers a function to be called after this
     * Single invokes either onSuccess or onError.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doAfterTerminate.png" class="diagram">
     *
     * @param {!function} callable
     * a function to be invoked when the source Single finishes.
     * @returns {Single}
     * a Single that emits the same items as the source
     * Single, then invokes the function.
     */
    doAfterTerminate(callable) {
      return doAfterTerminate(this, callable);
    }

    /**
     * Calls the specified action after this Single signals
     * onSuccess or onError or gets disposed by the downstream.
     *
     * In case of a race between a terminal event and a dispose
     * call, the provided onFinally action is executed once per
     * subscription.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doFinally.png" class="diagram">
     *
     * @param {!Function} callable
     * the action function when this Single terminates or gets disposed
     * @returns {Single}
     */
    doFinally(callable) {
      return doAfterTerminate$1(this, callable);
    }

    /**
     * Calls the shared function if a Observer
     * subscribed to the current Single disposes
     * the common Disposable it received via
     * onSubscribe.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doOnDispose.png" class="diagram">
     *
     * @param {!Function} callable
     * the function called when the subscription is disposed
     * @returns {Single}
     */
    doOnDispose(callable) {
      return doOnDispose(this, callable);
    }

    /**
     * Calls the shared function with the error
     * sent via onError for each Observer that
     * subscribes to the current Single.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doOnError.2.png" class="diagram">
     *
     * @param {!function(x: any)} callable
     * the function called with the success value of onError
     * @returns {Single}
     */
    doOnError(callable) {
      return doOnError(this, callable);
    }

    /**
     * Calls the shared consumer with the error
     * sent via onError or the value via onSuccess
     * for each SingleObserver that subscribes
     * to the current Single.
     *
     * @param {!function(onSuccess: any, onError: any)} callable
     * the function called with the success value of onEvent
     * @returns {Single}
     */
    doOnEvent(callable) {
      return doOnEvent(this, callable);
    }

    /**
     * Calls the shared function with the Disposable
     * sent through the onSubscribe for each Observer
     * that subscribes to the current Single.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doOnSubscribe.png" class="diagram">
     *
     * @param {!function(x: Disposable)} callable
     * the function called with the Disposable sent via onSubscribe
     * @returns {Single}
     */
    doOnSubscribe(callable) {
      return doOnSubscribe(this, callable);
    }

    /**
     * Calls the shared function with the error sent
     * via onSuccess for each Observer that subscribes
     * to the current Single.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doOnSuccess.2.png" class="diagram">
     *
     * @param {!function(x: any)} callable
     * the function called with the success value of onSuccess
     * @returns {Single}
     */
    doOnSuccess(callable) {
      return doOnSuccess(this, callable);
    }

    /**
     * Returns a Single instance that calls the given
     * onTerminate callback just before this Single
     * completes normally or with an exception.
     *
     * This differs from doAfterTerminate in that this happens
     * before the onComplete or onError notification.
     *
     * @param {!Function} callable
     * the action to invoke when the consumer calls
     * onComplete or onError
     * @returns {Single}
     */
    doOnTerminate(callable) {
      return doOnTerminate(this, callable);
    }

    /**
     * Creates a Single with an error.
     *
     * Signals an error returned by the callback function
     * for each individual Observer or returns a Single
     * that invokes a subscriber's onError method when
     * the subscriber subscribes to it.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.error.png" class="diagram">
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.error.c.png" class="diagram">
     *
     * @param {!(function():any|any)} err
     * - the callable that is called for each individual
     * Observer and returns or throws a value to be emitted.
     * - the particular value to pass to onError
     * @returns {Single}
     * a Single that invokes the subscriber's onError method
     * when the subscriber subscribes to it
     */
    static error(err) {
      return error(err);
    }

    /**
     * Returns a Single that is based on applying a specified
     * function to the item emitted by the source Single, where
     * that function returns a Single.
     *
     * @param {!function(x: any):Single} mapper
     * a function that, when applied to the item emitted by the
     * source Single, returns a SingleSource
     * @returns {Single}
     * the Single returned from mapper when applied to the item
     * emitted by the source Single
     */
    flatMap(mapper) {
      return flatMap(this, mapper);
    }

    /**
     * Returns a Single that invokes passed function and
     * emits its result for each new SingleObserver that
     * subscribes.
     *
     * Allows you to defer execution of passed function
     * until Observer subscribes to the Single. It makes
     * passed function "lazy".
     *
     * Result of the function invocation will be emitted
     * by the Single.
     *
     * If the result is a Promise-like instance, the
     * Observer is then subscribed to the Promise through
     * the fromPromise operator.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.fromCallable.png" class="diagram">
     *
     * @param {!function():any} callable
     * function which execution should be deferred, it will
     * be invoked when SingleObserver will subscribe to
     * the Single.
     * @returns {Single}
     * a Single whose Observer' subscriptions trigger
     * an invocation of the given function.
     */
    static fromCallable(callable) {
      return fromCallable(callable);
    }

    /**
     * Converts a Promise-like instance into a Single.
     *
     * @param {!(Promise|Thennable|PromiseLike)} promise
     * The promise to be converted into a Single.
     * @returns {Single}
     */
    static fromPromise(promise) {
      return fromPromise(promise);
    }

    /**
     * Provides a Promise-like interface for emitting signals.
     *
     * @param {!function(resolve: function, reject:function))} fulfillable
     * A function that accepts two parameters: resolve and reject,
     * similar to a Promise construct.
     * @returns {Single}
     */
    static fromResolvable(fulfillable) {
      return fromResolvable(fulfillable);
    }

    /**
     * Returns a Single that emits a specified item.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.just.png" class="diagram">
     *
     * @param {!any} value
     * the item to emit
     * @returns {Single}
     * a Single that emits item
     */
    static just(value) {
      return just(value);
    }

    /**
     * This method requires advanced knowledge about building
     * operators, please consider other standard composition
     * methods first; Returns a Single which, when subscribed
     * to, invokes the operator function for each individual
     * downstream Single and allows the insertion of a custom
     * operator by accessing the downstream's Observer during
     * this subscription phase and providing a new Observer,
     * containing the custom operator's intended business logic,
     * that will be used in the subscription process going
     * further upstream.
     *
     * Generally, such a new Observer will wrap the downstream's
     * Observer and forwards the onSuccess and onError events
     * from the upstream directly or according to the emission
     * pattern the custom operator's business logic requires.
     * In addition, such operator can intercept the flow control
     * calls of dispose and isDisposed that would have traveled
     * upstream and perform additional actions depending on the
     * same business logic requirements.
     *
     * Note that implementing custom operators via this lift()
     * method adds slightly more overhead by requiring an additional
     * allocation and indirection per assembled flows. Instead,
     * using compose() method and  creating a transformer function
     * with it is recommended.
     *
     * @param {!function(observer: Observer):Observer} operator
     * the function that receives the downstream's SingleObserver
     * and should return a SingleObserver with custom behavior
     * to be used as the consumer for the current Single.
     * @returns {Single}
     */
    lift(operator) {
      return lift(this, operator);
    }

    /**
     * Returns a Single that applies a specified function
     * to the item emitted by the source Single and emits
     * the result of this function application.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.map.png" class="diagram">
     *
     * @param {?function(x: any):any} mapper
     * a function to apply to the item emitted by the Single
     * @returns {Single}
     * a Single that emits the item from the source Single,
     * transformed by the specified function
     */
    map(mapper) {
      return map(this, mapper);
    }

    /**
     * Flattens a Single that emits a Single into a single Single
     * that emits the item emitted by the nested Single, without
     * any transformation.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.merge.oo.png" class="diagram">
     *
     * @param {!Single} source
     * a Single that emits a Single
     * @returns {Single}
     * a Single that emits the item that is the result of flattening
     * the Single emitted by source.
     */
    static merge(source) {
      return merge(source);
    }

    /**
     * Returns a singleton instance of a never-signalling
     * Single (only calls onSubscribe).
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.never.png" class="diagram">
     *
     * @returns {Single}
     */
    static never() {
      return never();
    }

    /**
     * Instructs a Single to pass control to another
     * Single rather than invoking Observer.onError
     * if it encounters an error.
     *
     * By default, when a Single encounters an error
     * that prevents it from emitting the expected item
     * to its Observer, the Single invokes its Observer's
     * onError method, and then quits without invoking any
     * more of its SingleObserver's methods.
     *
     * The onErrorResumeNext method changes this behavior.
     * If you pass another Single (resumeIfError) or if you
     * pass a function that will return another Single
     * (resumeIfError) to a Single's onErrorResumeNext
     * method, if the original Single encounters an error,
     * instead of invoking its Observer's onError method,
     * it will instead relinquish control to resumeIfError
     * which will invoke the Observer's onSuccess method
     * if it is able to do so. In such a case,
     * because no Single necessarily invokes onError, the
     * Observer may never know that an error happened.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.onErrorResumeNext.f.png" class="diagram">
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.onErrorResumeNext.png" class="diagram">
     *
     * @param {!(function(x: any):Single|Single)} resumeIfError
     * @returns {Single}
     */
    onErrorResumeNext(resumeIfError) {
      return onErrorResumeNext(this, resumeIfError);
    }

    /**
     * Instructs a Single to emit an item (returned by
     * a specified function) rather than invoking
     * onError if it encounters an error.
     *
     * By default, when a Single encounters an error that
     * prevents it from emitting the expected item to its
     * subscriber, the Single invokes its subscriber's
     * Observer.onError method, and then quits without
     * invoking any more of its subscriber's methods.
     * The onErrorReturn method changes this behavior.
     * If you pass a function (resumeFunction) to a Single's
     * onErrorReturn method, if the original Single encounters
     * an error, instead of invoking its subscriber's
     * Observer.onError method, it will instead emit the
     * return value of resumeIfError.
     *
     * You can use this to prevent errors from propagating
     * or to supply fallback data should errors be encountered.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.onErrorReturn.png" class="diagram">
     *
     * @param {!function(e: any):any} resumeFunction
     * a function that returns an item that the new Single
     * will emit if the source Single encounters an error
     * @returns {Single}
     */
    onErrorReturn(resumeFunction) {
      return onErrorReturn(this, resumeFunction);
    }


    /**
     * Signals the specified value as success in case
     * the current Single signals an error.
     *
     * @param {!any} item
     * the value to signal if the current Single fails
     * @returns {Single}
     */
    onErrorReturnItem(item) {
      return onErrorReturnItem(this, item);
    }

    /**
     * Re-subscribe to the current Single if the given predicate
     * returns true when the Single fails with an onError.
     *
     * If no predicate is provided, repeatedly re-subscribes to
     * the current Single indefinitely if it fails with an onError.
     *
     * @param {?function(retries: number, err: any):boolean} predicate
     * the predicate called with the resubscription count and the failure
     * value and should return true if a resubscription should happen.
     * @returns {Single}
     */
    retry(predicate) {
      return retry(this, predicate);
    }

    /**
     * @desc
     * Subscribes with an Object that is an Observer.
     *
     * An Object is considered as an Observer if:
     *  - if it has the method onSubscribe
     *  - if it has the method onSuccess (optional)
     *  - if it has the method onError (optional)
     *
     * The onSubscribe method is called when subscribeWith
     * or subscribe is executed. This method receives an
     * object that implements the Disposable interface.
     *
     * @param {!Object} observer
     * @returns {undefined}
     */
    subscribeWith(observer) {
      if (isObserver(observer)) {
        this.subscribeActual(observer);
      }
    }

    /**
     * @desc
     * Subscribes to a Single instance with an onSuccess
     * and an onError method.
     *
     * onSuccess receives a non-undefined value.
     * onError receives a string(or an Error object).
     *
     * Both are called once.
     * @param {?function(x: any)} onSuccess
     * the function you have designed to accept the emission
     * from the Single
     * @param {?function(x: any)} onError
     * the function you have designed to accept any error
     * notification from the Single
     * @returns {Disposable}
     * a Disposable reference can request the Single stop work.
     */
    subscribe(onSuccess, onError) {
      const disposable = new SimpleDisposable();
      this.subscribeActual({
        onSubscribe(d) {
          disposable.setDisposable(d);
        },
        onSuccess,
        onError,
      });
      return disposable;
    }

    /**
     * Returns a Single that emits the item emitted by
     * the source Single until a second Single emits an
     * item. Upon emission of an item from other,
     * this will emit an error rather than go to
     * Observer.onSuccess.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/takeUntil.png" class="diagram">
     *
     * @param {Single} other
     * the Single whose emitted item will cause takeUntil
     * to emit the item from the source Single
     * @returns {Single}
     * a Single that emits the item emitted by the source
     * Single until such time as other emits its item
     */
    takeUntil(other) {
      return takeUntil(this, other);
    }

    /**
     * Signals success with 0 value after the given
     * delay for each Observer.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.timer.png" class="diagram">
     *
     * @param {!Number} amount
     * the amount of time in milliseconds.
     * @returns {Single}
     */
    static timer(amount) {
      return timer(amount);
    }

    /**
     * Signals a TimeoutException if the current Single
     * doesn't signal a success value within the specified
     * timeout window.
     * @param {!Number} amount
     * amount of time in milliseconds.
     * @returns {Single}
     */
    timeout(amount) {
      return timeout(this, amount);
    }

    /**
     * Waits until all Single sources provided via an
     * iterable signal a success value and calls a zipper
     * function with an array of these values to return
     * a result to be emitted to downstream.
     *
     * If the Iterable of SingleSources is empty a NoSuchElementException
     * error is signalled after subscription.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.zip.png" class="diagram">
     *
     * @param {!Iterable} sources
     * the Iterable sequence of SingleSource instances.
     * An empty sequence will result in an onError signal
     * of NoSuchElementException.
     * @param {?Function} zipper
     * the function that receives an array with values
     * from each Single and should return a value to be
     * emitted to downstream
     * @returns {Single}
     */
    static zip(sources, zipper) {
      return zip(sources, zipper);
    }

    /**
     * Returns a Single that emits the result of applying
     * a specified function to the pair of items emitted
     * by the source Single and another specified Single.
     *
     * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.zip.png" class="diagram">
     *
     * @param {!Single} other
     * the other Single
     * @param {?Function} zipper
     * a function that combines the pairs of items from
     * the two Singles to generate the items to be emitted
     * by the resulting Single
     * @returns {Single}
     * a Single that pairs up values from the source Single
     * and the other Single and emits the results of
     * zipper applied to these pairs
     */
    zipWith(other, zipper) {
      return zipWith(this, other, zipper);
    }

    /**
     * Converts the Single to a Promise instance.
     *
     * @returns {Promise}
     */
    toPromise() {
      return new Promise((res, rej) => {
        this.subscribe(res, rej);
      });
    }

    /**
     * Converts the Single to a Promise instance
     * and attaches callbacks to it.
     *
     * @param {!function(x: any):any} onFulfill
     * @param {?function(x: any):any} onReject
     * @returns {Promise}
     */
    then(onFulfill, onReject) {
      return this.toPromise().then(onFulfill, onReject);
    }

    /**
     * Converts the Single to a Promise instance
     * and attaches an onRejection callback to it.
     *
     * @param {!function(x: any):any} onReject
     * @returns {Promise}
     */
    catch(onReject) {
      return this.toPromise().catch(onReject);
    }
  }

  /**
   * @interface
   * Represents a disposable/cancellable state.
   */

  /**
   * @interface
   * Represents an object that receives notification to
   * an Observer.
   *
   * Emitter is an abstraction layer of the Observer
   */

  /**
   * @interface
   * Represents an object that receives notification from
   * an Emitter.
   */

  /* eslint-disable no-unused-vars */

  return Single;

}());