'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var rxCancellable = require('rx-cancellable');
var Scheduler = _interopDefault(require('rx-scheduler'));

/**
 * @ignore
 */
// eslint-disable-next-line valid-typeof
const isType = (x, y) => typeof x === y;
/**
 * @ignore
 */
const isFunction = x => isType(x, 'function');
/**
 * @ignore
 */
const isNumber = x => isType(x, 'number');
/**
 * @ignore
 */
const isObject = x => isType(x, 'object');
/**
 * @ignore
 */
const isNull = x => x == null;
/**
 * @ignore
 */
const exists = x => x != null;
/**
 * @ignore
 */
const isOf = (x, y) => x instanceof y;
/**
 * @ignore
 */
const isArray = x => isOf(x, Array);
/**
 * @ignore
 */
const isIterable = obj => isObject(obj) && isFunction(obj[Symbol.iterator]);
/**
 * @ignore
 */
const isObserver = obj => isObject(obj) && isFunction(obj.onSubscribe);
/**
 * @ignore
 */
const toCallable = x => () => x;
/**
 * @ignore
 */
const isPromise = (obj) => {
  if (isNull(obj)) return false;
  if (isOf(obj, Promise)) return true;
  return (isObject(obj) || isFunction(obj)) && isFunction(obj.then);
};
/**
 * @ignore
 */
const identity = x => x;
/**
 * @ignore
 */
const throwError = (x) => { throw x; };
/**
 * @ignore
 */
const cleanObserver = x => ({
  onSubscribe: x.onSubscribe,
  onSuccess: isFunction(x.onSuccess) ? x.onSuccess : identity,
  onError: isFunction(x.onError) ? x.onError : throwError,
});
/**
 * @ignore
 */
const immediateSuccess = (o, x) => {
  const { onSubscribe, onSuccess } = cleanObserver(o);
  const controller = new rxCancellable.BooleanCancellable();
  onSubscribe(controller);

  if (!controller.cancelled) {
    onSuccess(x);
    controller.cancel();
  }
};
/**
 * @ignore
 */
const immediateError = (o, x) => {
  const { onSubscribe, onError } = cleanObserver(o);
  const controller = new rxCancellable.BooleanCancellable();
  onSubscribe(controller);

  if (!controller.cancelled) {
    onError(x);
    controller.cancel();
  }
};

/**
 * @ignore
 */
const defaultScheduler = sched => (
  isOf(sched, Scheduler.interface)
    ? sched
    : Scheduler.current
);

/**
 * @ignore
 */
function subscribeActual(observer) {
  let err;

  try {
    err = this.supplier();

    if (isNull(err)) {
      throw new Error('Single.error: Error supplier returned a null value.');
    }
  } catch (e) {
    err = e;
  }
  immediateError(observer, err);
}
/**
 * @ignore
 */
var error = (value) => {
  let report = value;
  if (!(isOf(value, Error) || isFunction(value))) {
    report = new Error('Single.error received a non-Error value.');
  }

  if (!isFunction(value)) {
    report = toCallable(report);
  }
  const single = new Single(subscribeActual);
  single.supplier = report;
  return single;
};

/**
 * @ignore
 */
var is = x => x instanceof Single;

/* eslint-disable no-restricted-syntax */

/**
 * @ignore
 */
function subscribeActual$1(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const controller = new rxCancellable.CompositeCancellable();

  onSubscribe(controller);

  const { sources } = this;

  for (const single of sources) {
    if (controller.cancelled) {
      return;
    }

    if (is(single)) {
      single.subscribeWith({
        onSubscribe(c) {
          controller.add(c);
        },
        // eslint-disable-next-line no-loop-func
        onSuccess(x) {
          onSuccess(x);
          controller.cancel();
        },
        onError(x) {
          onError(x);
          controller.cancel();
        },
      });
    } else {
      onError(new Error('Single.amb: One of the sources is a non-Single.'));
      controller.cancel();
      break;
    }
  }
}
/**
 * @ignore
 */
var amb = (sources) => {
  if (!isIterable(sources)) {
    return error(new Error('Single.amb: sources is not Iterable.'));
  }
  const single = new Single(subscribeActual$1);
  single.sources = sources;
  return single;
};

/* eslint-disable no-restricted-syntax */

/**
 * @ignore
 */
function subscribeActual$2(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { sources } = this;
  const { length } = sources;

  if (length === 0) {
    immediateError(observer, new Error('Single.ambArray: sources Array is empty.'));
  } else {
    const controller = new rxCancellable.CompositeCancellable();

    onSubscribe(controller);

    for (let i = 0; i < length; i += 1) {
      const single = sources[i];
      if (controller.cancelled) {
        return;
      }
      if (is(single)) {
        single.subscribeWith({
          onSubscribe(c) {
            controller.add(c);
          },
          // eslint-disable-next-line no-loop-func
          onSuccess(x) {
            onSuccess(x);
            controller.cancel();
          },
          onError(x) {
            onError(x);
            controller.cancel();
          },
        });
      } else {
        onError(new Error('Single.ambArray: One of the sources is a non-Single.'));
        controller.cancel();
        break;
      }
    }
  }
}
/**
 * @ignore
 */
var ambArray = (sources) => {
  if (!isArray(sources)) {
    return error(new Error('Single.ambArray: sources is not an Array.'));
  }
  const single = new Single(subscribeActual$2);
  single.sources = sources;
  return single;
};

/**
 * @ignore
 */
var ambWith = (source, other) => {
  if (!(is(other))) {
    return source;
  }
  return ambArray([source, other]);
};

/**
 * @ignore
 */
function subscribeActual$3(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const {
    source, cached, observers, subscribed,
  } = this;

  if (!cached) {
    const index = observers.length;
    observers[index] = observer;

    const controller = new rxCancellable.BooleanCancellable();

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
          controller.cancel();
          this.observers = undefined;
        },
        onError: (x) => {
          this.cached = true;
          this.error = x;

          // eslint-disable-next-line no-restricted-syntax
          for (const obs of observers) {
            obs.onError(x);
          }
          controller.cancel();
          this.observers = undefined;
        },
      });
      this.subscribed = true;
    }
  } else {
    const controller = new rxCancellable.BooleanCancellable();
    onSubscribe(controller);

    const { value, error } = this;
    if (exists(value)) {
      onSuccess(value);
    }
    if (exists(error)) {
      onError(error);
    }
    controller.cancel();
  }
}

/**
 * @ignore
 */
var cache = (source) => {
  const single = new Single(subscribeActual$3);
  single.source = source;
  single.cached = false;
  single.subscribed = false;
  single.observers = [];
  return single;
};

/**
 * Abstraction over a SingleObserver that allows associating
 * a resource with it.
 *
 * Calling onSuccess(Object) multiple times has no effect.
 * Calling onError(Error) multiple times or after onSuccess
 * has no effect.
 */
// eslint-disable-next-line no-unused-vars
class SingleEmitter extends rxCancellable.Cancellable {
  constructor(success, error) {
    super();
    /**
     * @ignore
     */
    this.success = success;
    /**
     * @ignore
     */
    this.error = error;
    /**
     * @ignore
     */
    this.link = new rxCancellable.BooleanCancellable();
  }

  /**
   * Returns true if the emitter is cancelled.
   * @returns {boolean}
   */
  get cancelled() {
    return this.link.cancelled;
  }

  /**
   * Returns true if the emitter is cancelled successfully.
   * @returns {boolean}
   */
  cancel() {
    return this.link.cancel();
  }

  /**
   * Set the given Cancellable as the Emitter's cancellable state.
   * @param {Cancellable} cancellable
   * The Cancellable instance
   * @returns {boolean}
   * Returns true if the cancellable is valid.
   */
  setCancellable(cancellable) {
    if (isOf(cancellable, rxCancellable.Cancellable)) {
      if (this.cancelled) {
        cancellable.cancel();
      } else if (cancellable.cancelled) {
        this.cancel();
        return true;
      } else {
        const { link } = this;
        this.link = cancellable;
        link.cancel();
        return true;
      }
    }
    return false;
  }

  /**
   * Emits a success value.
   * @param {!any} value
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onSuccess(value) {
    if (this.cancelled) {
      return;
    }
    try {
      if (isNull(value)) {
        this.error(new Error('onSuccess called with a null value.'));
      } else {
        this.success(value);
      }
    } finally {
      this.cancel();
    }
  }

  /**
   * Emits an error value.
   * @param {!Error} err
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  onError(err) {
    let report = err;
    if (!isOf(err, Error)) {
      report = new Error('onError called with a non-Error value.');
    }
    if (this.cancelled) {
      return;
    }
    try {
      this.error(report);
    } finally {
      this.cancel();
    }
  }
}

/**
 * @ignore
 */
function subscribeActual$4(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const emitter = new SingleEmitter(onSuccess, onError);

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
var create = (subscriber) => {
  if (!isFunction(subscriber)) {
    return error(new Error('Single.create: There are no subscribers.'));
  }
  const single = new Single(subscribeActual$4);
  single.subscriber = subscriber;
  return single;
};

/**
 * @ignore
 */
var compose = (source, transformer) => {
  if (!isFunction(transformer)) {
    return source;
  }

  let result;

  try {
    result = transformer(source);

    if (!is(result)) {
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
function subscribeActual$5(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

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
var contains = (source, value, comparer) => {
  if (isNull(value)) {
    return source;
  }

  let cmp = comparer;
  if (!isFunction(cmp)) {
    cmp = containsComparer;
  }

  const single = new Single(subscribeActual$5);
  single.source = source;
  single.value = value;
  single.comparer = cmp;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$6(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  let result;

  let err;
  try {
    result = this.supplier();
    if (!is(result)) {
      throw new Error('Single.defer: supplier returned a non-Single.');
    }
  } catch (e) {
    err = e;
  }

  if (exists(err)) {
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
var defer = (supplier) => {
  const single = new Single(subscribeActual$6);
  single.supplier = supplier;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$7(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { amount, scheduler, doDelayError } = this;

  const controller = new rxCancellable.LinkedCancellable();

  onSubscribe(controller);

  this.source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onSuccess(x) {
      controller.link(
        scheduler.delay(() => {
          onSuccess(x);
        }, amount),
      );
    },
    onError(x) {
      controller.link(
        scheduler.delay(() => {
          onError(x);
        }, doDelayError ? amount : 0),
      );
    },
  });
}
/**
 * @ignore
 */
var delay = (source, amount, scheduler, doDelayError) => {
  if (!isNumber(amount)) {
    return source;
  }
  const single = new Single(subscribeActual$7);
  single.source = source;
  single.amount = amount;
  single.scheduler = defaultScheduler(scheduler);
  single.doDelayError = doDelayError;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$8(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { amount, scheduler, source } = this;
  const controller = new rxCancellable.LinkedCancellable();

  onSubscribe(controller);

  controller.link(
    scheduler.delay(() => {
      controller.unlink();
      source.subscribeWith({
        onSubscribe(ac) {
          controller.link(ac);
        },
        onSuccess,
        onError,
      });
    }, amount),
  );
}
/**
 * @ignore
 */
var delaySubscription = (source, amount, scheduler) => {
  if (!isNumber(amount)) {
    return source;
  }
  const single = new Single(subscribeActual$8);
  single.source = source;
  single.amount = amount;
  single.scheduler = defaultScheduler(scheduler);
  return single;
};

/**
 * @ignore
 */
function subscribeActual$9(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { source, other } = this;

  const controller = new rxCancellable.LinkedCancellable();

  onSubscribe(controller);

  other.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onSuccess() {
      controller.unlink();
      source.subscribeWith({
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
var delayUntil = (source, other) => {
  if (!is(other)) {
    return source;
  }
  const single = new Single(subscribeActual$9);
  single.source = source;
  single.other = other;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$a(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

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
var doAfterSuccess = (source, callable) => {
  if (!isFunction(callable)) {
    return source;
  }

  const single = new Single(subscribeActual$a);
  single.source = source;
  single.callable = callable;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$b(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

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
var doAfterTerminate = (source, callable) => {
  if (!isFunction(callable)) {
    return source;
  }

  const single = new Single(subscribeActual$b);
  single.source = source;
  single.callable = callable;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$c(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { source, callable } = this;

  let called = false;
  source.subscribeWith({
    onSubscribe(ac) {
      ac.addEventListener('cancel', () => {
        if (!called) {
          callable();
          called = true;
        }
      });
      onSubscribe(ac);
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
var doFinally = (source, callable) => {
  if (!isFunction(callable)) {
    return source;
  }

  const single = new Single(subscribeActual$c);
  single.source = source;
  single.callable = callable;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$d(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { source, callable } = this;

  source.subscribeWith({
    onSubscribe(ac) {
      ac.addEventListener('cancel', callable);
      onSubscribe(ac);
    },
    onSuccess,
    onError,
  });
}

/**
 * @ignore
 */
var doOnCancel = (source, callable) => {
  if (!isFunction(callable)) {
    return source;
  }

  const single = new Single(subscribeActual$d);
  single.source = source;
  single.callable = callable;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$e(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

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
var doOnError = (source, callable) => {
  if (!isFunction(callable)) {
    return source;
  }

  const single = new Single(subscribeActual$e);
  single.source = source;
  single.callable = callable;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$f(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

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
var doOnEvent = (source, callable) => {
  if (!isFunction(callable)) {
    return source;
  }

  const single = new Single(subscribeActual$f);
  single.source = source;
  single.callable = callable;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$g(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

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
var doOnSuccess = (source, callable) => {
  if (!isFunction(callable)) {
    return source;
  }

  const single = new Single(subscribeActual$g);
  single.source = source;
  single.callable = callable;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$h(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

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
var doOnSubscribe = (source, callable) => {
  if (!isFunction(callable)) {
    return source;
  }
  const single = new Single(subscribeActual$h);
  single.source = source;
  single.callable = callable;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$i(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

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
var doOnTerminate = (source, callable) => {
  if (!isFunction(callable)) {
    return source;
  }

  const single = new Single(subscribeActual$i);
  single.source = source;
  single.callable = callable;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$j(observer) {
  const { onSubscribe, onError, onSuccess } = cleanObserver(observer);

  const controller = new rxCancellable.LinkedCancellable();

  onSubscribe(controller);

  const { mapper, source } = this;

  source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onSuccess(x) {
      let result;
      try {
        result = mapper(x);

        if (!is(result)) {
          throw new Error('Single.flatMap: mapper returned a non-Single');
        }
      } catch (e) {
        onError(e);
        return;
      }
      controller.unlink();
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
var flatMap = (source, mapper) => {
  if (!isFunction(mapper)) {
    return source;
  }

  const single = new Single(subscribeActual$j);
  single.source = source;
  single.mapper = mapper;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$k(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const emitter = new SingleEmitter(onSuccess, onError);

  onSubscribe(emitter);

  this.promise.then(
    x => emitter.onSuccess(x),
    x => emitter.onError(x),
  );
}
/**
 * @ignore
 */
var fromPromise = (promise) => {
  if (!isPromise(promise)) {
    return error(new Error('Single.fromPromise: expects a Promise-like value.'));
  }
  const single = new Single(subscribeActual$k);
  single.promise = promise;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$l(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const emitter = new SingleEmitter(onSuccess, onError);

  onSubscribe(emitter);

  let result;
  try {
    result = this.callable();
  } catch (e) {
    emitter.onError(e);
    return;
  }

  if (isPromise(result)) {
    fromPromise(result).subscribeWith({
      onSubscribe(ac) {
        emitter.setCancellable(ac);
      },
      onSuccess(x) {
        emitter.onSuccess(x);
      },
      onError(e) {
        emitter.onError(e);
      },
    });
  } else {
    emitter.onSuccess(result);
  }
}
/**
 * @ignore
 */
var fromCallable = (callable) => {
  if (!isFunction(callable)) {
    return error(new Error('Single.fromCallable: callable received is not a function.'));
  }
  const single = new Single(subscribeActual$l);
  single.callable = callable;
  return single;
};

function subscribeActual$m(observer) {
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
var fromResolvable = (subscriber) => {
  if (!isFunction(subscriber)) {
    return error(new Error('Single.fromResolvable: expects a function.'));
  }
  const single = new Single(subscribeActual$m);
  single.subscriber = subscriber;
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
var just = (value) => {
  if (isNull(value)) {
    return error(new Error('Single.just: received a null value.'));
  }
  const single = new Single(subscribeActual$n);
  single.value = value;
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
var lift = (source, operator) => {
  if (!isFunction(operator)) {
    return source;
  }

  const single = new Single(subscribeActual$o);
  single.source = source;
  single.operator = operator;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$p(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { mapper } = this;

  this.source.subscribeWith({
    onSubscribe,
    onSuccess(x) {
      let result;
      try {
        result = mapper(x);
        if (isNull(result)) {
          throw new Error('Single.map: mapper function returned a null value.');
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
var map = (source, mapper) => {
  if (!isFunction(mapper)) {
    return source;
  }
  const single = new Single(subscribeActual$p);
  single.source = source;
  single.mapper = mapper;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$q(observer) {
  const { onSubscribe, onError, onSuccess } = cleanObserver(observer);

  const controller = new rxCancellable.LinkedCancellable();

  onSubscribe(controller);

  this.source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onSuccess(x) {
      controller.unlink();
      let result = x;
      if (!is(x)) {
        result = error(new Error('Single.merge: source emitted a non-Single value.'));
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
var merge = (source) => {
  if (!is(source)) {
    return error(new Error('Single.merge: source is not a Single.'));
  }

  const single = new Single(subscribeActual$q);
  single.source = source;
  return single;
};

function subscribeActual$r(observer) {
  const { onSubscribe, onSuccess, onError } = cleanObserver(observer);

  const { source, scheduler } = this;

  const controller = new rxCancellable.LinkedCancellable();

  onSubscribe(controller);

  source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onSuccess(x) {
      controller.link(scheduler.schedule(() => {
        onSuccess(x);
      }));
    },
    onError(x) {
      controller.link(scheduler.schedule(() => {
        onError(x);
      }));
    },
  });
}
/**
 * @ignore
 */
var observeOn = (source, scheduler) => {
  const single = new Single(subscribeActual$r);
  single.source = source;
  single.scheduler = defaultScheduler(scheduler);
  return single;
};

function subscribeActual$s(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { source, resumeIfError } = this;

  const controller = new rxCancellable.LinkedCancellable();

  onSubscribe(controller);

  source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onSuccess,
    onError(x) {
      let result;

      if (isFunction(resumeIfError)) {
        try {
          result = resumeIfError(x);
          if (!is(result)) {
            throw new Error('Single.onErrorResumeNext: returned an non-Single.');
          }
        } catch (e) {
          onError(new Error([x, e]));
          return;
        }
      } else {
        result = resumeIfError;
      }

      controller.unlink();
      result.subscribeWith({
        onSubscribe(ac) {
          controller.link(ac);
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
var onErrorResumeNext = (source, resumeIfError) => {
  if (!(isFunction(resumeIfError) || is(resumeIfError))) {
    return source;
  }

  const single = new Single(subscribeActual$s);
  single.source = source;
  single.resumeIfError = resumeIfError;
  return single;
};

function subscribeActual$t(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { source, item } = this;

  source.subscribeWith({
    onSubscribe,
    onSuccess,
    onError(x) {
      let result;

      try {
        result = item(x);

        if (isNull(result)) {
          throw new Error(new Error('Single.onErrorReturn: returned a null value.'));
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
var onErrorReturn = (source, item) => {
  if (!isFunction(item)) {
    return source;
  }

  const single = new Single(subscribeActual$t);
  single.source = source;
  single.item = item;
  return single;
};

function subscribeActual$u(observer) {
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
var onErrorReturnItem = (source, item) => {
  if (isNull(item)) {
    return source;
  }

  const single = new Single(subscribeActual$u);
  single.source = source;
  single.item = item;
  return single;
};

/* eslint-disable class-methods-use-this */
/**
 * @ignore
 */
let INSTANCE;
/**
 * @ignore
 */
var never = () => {
  if (isNull(INSTANCE)) {
    INSTANCE = new Single(o => o.onSubscribe(rxCancellable.UNCANCELLED));
  }
  return INSTANCE;
};

/**
 * @ignore
 */
function subscribeActual$v(observer) {
  const { onSubscribe, onSuccess, onError } = cleanObserver(observer);

  const controller = new rxCancellable.LinkedCancellable();

  onSubscribe(controller);

  const { source, bipredicate } = this;

  let retries = -1;

  const sub = () => {
    retries += 1;
    controller.unlink();
    source.subscribeWith({
      onSubscribe(ac) {
        controller.link(ac);
      },
      onSuccess,
      onError(x) {
        if (isFunction(bipredicate)) {
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
  };

  sub();
}

/**
 * @ignore
 */
var retry = (source, bipredicate) => {
  const single = new Single(subscribeActual$v);
  single.source = source;
  single.bipredicate = bipredicate;
  return single;
};

function subscribeActual$w(observer) {
  const { onSubscribe, onSuccess, onError } = cleanObserver(observer);

  const { source, scheduler } = this;

  const controller = new rxCancellable.LinkedCancellable();

  onSubscribe(controller);

  controller.link(scheduler.schedule(() => {
    controller.unlink();
    source.subscribeWith({
      onSubscribe(ac) {
        controller.link(ac);
      },
      onSuccess,
      onError,
    });
  }));
}
/**
 * @ignore
 */
var subscribeOn = (source, scheduler) => {
  const single = new Single(subscribeActual$w);
  single.source = source;
  single.scheduler = defaultScheduler(scheduler);
  return single;
};

/**
 * @ignore
 */
function subscribeActual$x(observer) {
  const { onSubscribe, onSuccess, onError } = cleanObserver(observer);

  const controller = new rxCancellable.CompositeCancellable();

  onSubscribe(controller);

  const { source, other } = this;

  other.subscribeWith({
    onSubscribe(ac) {
      controller.add(ac);
    },
    onSuccess() {
      onError(new Error('Single.takeUntil: Source cancelled by other Single.'));
      controller.cancel();
    },
    onError(x) {
      onError(new Error(['Single.takeUntil: Source cancelled by other Single.', x]));
      controller.cancel();
    },
  });

  source.subscribeWith({
    onSubscribe(ac) {
      controller.add(ac);
    },
    onSuccess(x) {
      onSuccess(x);
      controller.cancel();
    },
    onError(x) {
      onError(x);
      controller.cancel();
    },
  });
}

/**
 * @ignore
 */
const takeUntil = (source, other) => {
  if (!is(other)) {
    return source;
  }

  const single = new Single(subscribeActual$x);
  single.source = source;
  single.other = other;
  return single;
};

/**
 * @ignore
 */
function subscribeActual$y(observer) {
  const { onSuccess, onSubscribe } = cleanObserver(observer);
  onSubscribe(this.scheduler.delay(() => onSuccess(0), this.amount));
}
/**
 * @ignore
 */
var timer = (amount, scheduler) => {
  if (!isNumber(amount)) {
    return error(new Error('Single.timer: "amount" is not a number.'));
  }
  const single = new Single(subscribeActual$y);
  single.amount = amount;
  single.scheduler = defaultScheduler(scheduler);
  return single;
};

/**
 * @ignore
 */
function subscribeActual$z(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const { amount, scheduler } = this;

  const controller = new rxCancellable.LinkedCancellable();

  onSubscribe(controller);

  const timeout = scheduler.delay(
    () => {
      onError(new Error('Single.timeout: TimeoutException (no success signals within the specified timeout).'));
      controller.cancel();
    },
    amount,
  );

  controller.addEventListener('cancel', () => timeout.cancel());

  this.source.subscribeWith({
    onSubscribe(ac) {
      controller.link(ac);
    },
    onSuccess,
    onError,
  });
}
/**
 * @ignore
 */
var timeout = (source, amount, scheduler) => {
  if (!isNumber(amount)) {
    return source;
  }
  const single = new Single(subscribeActual$z);
  single.source = source;
  single.amount = amount;
  single.scheduler = defaultScheduler(scheduler);
  return single;
};

const defaultZipper = x => x;
/**
 * @ignore
 */
function subscribeActual$A(observer) {
  const { onSuccess, onError, onSubscribe } = cleanObserver(observer);

  const result = [];

  const { sources, zipper } = this;

  const size = sources.length;

  if (size === 0) {
    immediateError(observer, new Error('Single.zipArray: source array is empty'));
  } else {
    const controller = new rxCancellable.CompositeCancellable();

    onSubscribe(controller); let pending = size;

    for (let i = 0; i < size; i += 1) {
      if (controller.cancelled) {
        return;
      }
      const single = sources[i];

      if (is(single)) {
        single.subscribeWith({
          onSubscribe(ac) {
            controller.add(ac);
          },
          // eslint-disable-next-line no-loop-func
          onSuccess(x) {
            result[i] = x;
            pending -= 1;
            if (pending === 0) {
              let r;
              try {
                r = zipper(result);
                if (isNull(r)) {
                  throw new Error('Single.zipArray: zipper function returned a null value.');
                }
              } catch (e) {
                onError(e);
                controller.cancel();
                return;
              }
              onSuccess(r);
              controller.cancel();
            }
          },
          onError(x) {
            onError(x);
            controller.cancel();
          },
        });
      } else {
        onError(new Error('Single.zipArray: One of the sources is non-Single.'));
        controller.cancel();
        return;
      }
    }
  }
}
/**
 * @ignore
 */
var zipArray = (sources, zipper) => {
  if (!isArray(sources)) {
    return error(new Error('Single.zipArray: sources is a non-Array.'));
  }
  let fn = zipper;
  if (!isFunction(zipper)) {
    fn = defaultZipper;
  }
  const single = new Single(subscribeActual$A);
  single.sources = sources;
  single.zipper = fn;
  return single;
};

/* eslint-disable no-restricted-syntax */
/**
 * @ignore
 */
var zip = (sources, zipper) => {
  if (!isIterable(sources)) {
    return error(new Error('Single.zip: sources is a non-Iterable.'));
  }

  const singles = [];

  for (const source of sources) {
    if (is(source)) {
      singles.push(source);
    } else {
      return error(new Error('Observable.zip: one of the sources is not a Single.'));
    }
  }
  return zipArray(singles, zipper);
};

/**
 * @ignore
 */
var zipWith = (source, other, zipper) => {
  if (!is(other)) {
    return source;
  }
  return zipArray([source, other], zipper);
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
 * with is the SingleObserver via the subscribeWith(SingleObserver)
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
 * the Cancellable instance provided to consumers through
 * SingleObserver.onSubscribe(Cancellable).
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
   * @ignore
   */
  constructor(subscribeActual) {
    this.subscribeActual = subscribeActual;
  }

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
   * Runs multiple Singles and signals the events of
   * the first one that signals (cancelling the rest).
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
   * Runs multiple Singles and signals the events of
   * the first one that signals (cancelling the rest).
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.ambArray.png" class="diagram">
   *
   * @param {!Array} sources
   * the array of sources. A subscription to each source
   * will occur in the same order as in this array.
   * @returns {Single}
   */
  static ambArray(sources) {
    return ambArray(sources);
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
   * Calls a function for each individual SingleObserver
   * to return the actual Single to be subscribed to.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.defer.png" class="diagram">
   *
   * @param {!function():any} callable
   * the Callable that is called for each individual
   * SingleObserver and returns a Single instance to subscribe to.
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
   * @param {?Scheduler} scheduler
   * the target scheduler to use for the non-blocking wait and emission.
   * By default, schedules on the current thread.
   * @param {?Boolean} doDelayError
   * if true, both success and error signals are delayed.
   * if false, only success signals are delayed.
   * @returns {Single}
   */
  delay(amount, scheduler, doDelayError) {
    return delay(this, amount, scheduler, doDelayError);
  }

  /**
   * Delays the actual subscription to the current
   * Single until the given time delay elapsed.
   *
   * @param {!Number} amount
   * the time amount to wait with the subscription
   * (in milliseconds).
   * @param {?Scheduler} scheduler
   * the target scheduler to use for the non-blocking wait and emission.
   * By default, schedules on the current thread.
   * @returns {Single}
   */
  delaySubscription(amount, scheduler) {
    return delaySubscription(this, amount, scheduler);
  }

  /**
   * Delays the actual subscription to the current Single
   * until the given other Single signals success.
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
   * onSuccess or onError or gets cancelled by the downstream.
   *
   * In case of a race between a terminal event and a cancel
   * call, the provided onFinally action is executed once per
   * subscription.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doFinally.png" class="diagram">
   *
   * @param {!Function} callable
   * the action function when this Single terminates or gets cancelled
   * @returns {Single}
   */
  doFinally(callable) {
    return doFinally(this, callable);
  }

  /**
   * Calls the shared function if a SingleObserver
   * subscribed to the current Single cancels
   * the common Cancellable it received via
   * onSubscribe.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doOnDispose.png" class="diagram">
   *
   * @param {!Function} callable
   * the function called when the subscription is cancelled
   * @returns {Single}
   */
  doOnCancel(callable) {
    return doOnCancel(this, callable);
  }

  /**
   * Calls the shared function with the error
   * sent via onError for each SingleObserver that
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
   * Calls the shared function with the Cancellable
   * sent through the onSubscribe for each SingleObserver
   * that subscribes to the current Single.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.doOnSubscribe.png" class="diagram">
   *
   * @param {!function(x: Cancellable)} callable
   * the function called with the Cancellable sent via onSubscribe
   * @returns {Single}
   */
  doOnSubscribe(callable) {
    return doOnSubscribe(this, callable);
  }

  /**
   * Calls the shared function with the error sent
   * via onSuccess for each SingleObserver that subscribes
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
   * for each individual SingleObserver or returns a Single
   * that invokes a subscriber's onError method when
   * the subscriber subscribes to it.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.error.png" class="diagram">
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.error.c.png" class="diagram">
   *
   * @param {!(function():Error|Error)} err
   * - the callable that is called for each individual
   * SingleObserver and returns or throws a value to be emitted.
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
   * source Single, returns a Single
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
   * until SingleObserver subscribes to the Single. It makes
   * passed function "lazy".
   *
   * Result of the function invocation will be emitted
   * by the Single.
   *
   * If the result is a Promise-like instance, the
   * SingleObserver is then subscribed to the Promise through
   * the fromPromise operator.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.fromCallable.png" class="diagram">
   *
   * @param {!function():any} callable
   * function which execution should be deferred, it will
   * be invoked when SingleObserver will subscribe to
   * the Single.
   * @returns {Single}
   * a Single whose SingleObserver' subscriptions trigger
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
   * operator by accessing the downstream's SingleObserver during
   * this subscription phase and providing a new SingleObserver,
   * containing the custom operator's intended business logic,
   * that will be used in the subscription process going
   * further upstream.
   *
   * Generally, such a new SingleObserver will wrap the downstream's
   * SingleObserver and forwards the onSuccess and onError events
   * from the upstream directly or according to the emission
   * pattern the custom operator's business logic requires.
   * In addition, such operator can intercept the flow control
   * calls of cancel and signal.cancelled that would have traveled
   * upstream and perform additional actions depending on the
   * same business logic requirements.
   *
   * Note that implementing custom operators via this lift()
   * method adds slightly more overhead by requiring an additional
   * allocation and indirection per assembled flows. Instead,
   * using compose() method and  creating a transformer function
   * with it is recommended.
   *
   * @param {!function(observer: SingleObserver):SingleObserver} operator
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
   * Modifies a Single to emit its item (or notify of its error)
   * on a specified Scheduler, asynchronously.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.observeOn.png" class="diagram">
   *
   * @param {?Scheduler} scheduler
   * the target scheduler to use for the non-blocking wait and emission.
   * By default, schedules on the current thread.
   * @return {Single}
   * the source Single modified so that its subscribers are
   * notified on the specified Scheduler
   */
  observeOn(scheduler) {
    return observeOn(this, scheduler);
  }

  /**
   * Instructs a Single to pass control to another
   * Single rather than invoking SingleObserver.onError
   * if it encounters an error.
   *
   * By default, when a Single encounters an error
   * that prevents it from emitting the expected item
   * to its SingleObserver, the Single invokes its SingleObserver's
   * onError method, and then quits without invoking any
   * more of its SingleObserver's methods.
   *
   * The onErrorResumeNext method changes this behavior.
   * If you pass another Single (resumeIfError) or if you
   * pass a function that will return another Single
   * (resumeIfError) to a Single's onErrorResumeNext
   * method, if the original Single encounters an error,
   * instead of invoking its SingleObserver's onError method,
   * it will instead relinquish control to resumeIfError
   * which will invoke the SingleObserver's onSuccess method
   * if it is able to do so. In such a case,
   * because no Single necessarily invokes onError, the
   * SingleObserver may never know that an error happened.
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
   * SingleObserver.onError method, and then quits without
   * invoking any more of its subscriber's methods.
   * The onErrorReturn method changes this behavior.
   * If you pass a function (resumeFunction) to a Single's
   * onErrorReturn method, if the original Single encounters
   * an error, instead of invoking its subscriber's
   * SingleObserver.onError method, it will instead emit the
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
   * @param {?function(retries: number, err: Error):boolean} predicate
   * the predicate called with the resubscription count and the failure
   * value and should return true if a resubscription should happen.
   * @returns {Single}
   */
  retry(predicate) {
    return retry(this, predicate);
  }

  /**
   * Asynchronously subscribes subscribers to this Single
   * on the specified Scheduler.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.subscribeOn.png" class="diagram">
   *
   * @param {?Scheduler} scheduler
   * the target scheduler to use for the non-blocking wait and emission.
   * By default, schedules on the current thread.
   * @returns {Single}
   * the source Single modified so that its subscriptions happen
   * on the specified Scheduler
   */
  subscribeOn(scheduler) {
    return subscribeOn(this, scheduler);
  }

  /**
   * @desc
   * Subscribes with an Object that is an SingleObserver.
   *
   * An Object is considered as an SingleObserver if:
   *  - if it has the method onSubscribe
   *  - if it has the method onSuccess (optional)
   *  - if it has the method onError (optional)
   *
   * The onSubscribe method is called when subscribeWith
   * or subscribe is executed. This method receives an
   * Cancellable instance.
   *
   * @param {!Object} observer
   * @returns {undefined}
   */
  subscribeWith(observer) {
    if (isObserver(observer)) {
      this.subscribeActual.call(this, observer);
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
   * @param {?function(x: Error)} onError
   * the function you have designed to accept any error
   * notification from the Single
   * @returns {Cancellable}
   * an Cancellable reference can request the Single to cancel.
   */
  subscribe(onSuccess, onError) {
    const controller = new rxCancellable.LinkedCancellable();
    this.subscribeWith({
      onSubscribe(ac) {
        controller.link(ac);
      },
      onSuccess,
      onError,
    });
    return controller;
  }

  /**
   * Returns a Single that emits the item emitted by
   * the source Single until a second Single emits an
   * item. Upon emission of an item from other,
   * this will emit an error rather than go to
   * SingleObserver.onSuccess.
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
   * delay for each SingleObserver.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.timer.png" class="diagram">
   *
   * @param {!Number} amount
   * the amount of time in milliseconds.
   * @param {?Scheduler} scheduler
   * the target scheduler to use for the non-blocking wait and emission.
   * By default, schedules on the current thread.
   * @returns {Single}
   */
  static timer(amount, scheduler) {
    return timer(amount, scheduler);
  }

  /**
   * Signals a TimeoutException if the current Single
   * doesn't signal a success value within the specified
   * timeout window.
   * @param {!Number} amount
   * amount of time in milliseconds.
   * @param {?Scheduler} scheduler
   * the target scheduler to use for the non-blocking wait and emission.
   * By default, schedules on the current thread.
   * @returns {Single}
   */
  timeout(amount, scheduler) {
    return timeout(this, amount, scheduler);
  }

  /**
   * Waits until all Single sources provided by the Iterable sequence signal a
   * success value and calls a zipper function with an array of these values to
   * return a result to be emitted to downstream.
   * @param {!Iterable} sources
   * the Iterable sequence of SingleSource instances. An empty sequence
   * will result in an onError signal.
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
   * Waits until all Single sources provided via
   * an array signal a success value and calls a zipper
   * function with an array of these values to return
   * a result to be emitted to downstream.
   *
   * If the array of Single is empty an error is
   * signalled immediately.
   *
   * <img src="https://raw.githubusercontent.com/LXSMNSYC/rx-single/master/assets/images/Single.zip.png" class="diagram">
   *
   * @param {!Array} sources
   * the array of Single instances. An empty sequence
   * will result in an onError signal.
   * @param {?Function} zipper
   * the function that receives an array with values
   * from each Single and should return a value to be
   * emitted to downstream
   * @returns {Single}
   */
  static zipArray(sources, zipper) {
    return zipArray(sources, zipper);
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
   * @param {?function(x: Error):any} onReject
   * @returns {Promise}
   */
  then(onFulfill, onReject) {
    return this.toPromise().then(onFulfill, onReject);
  }

  /**
   * Converts the Single to a Promise instance
   * and attaches an onRejection callback to it.
   *
   * @param {!function(x: Error):any} onReject
   * @returns {Promise}
   */
  catch(onReject) {
    return this.toPromise().catch(onReject);
  }
}

/**
 * Provides a mechanism for receiving push-based notification
 * of a single value or an error.
 *
 * When a SingleObserver is subscribed to a Single through
 * the Single.subscribe(SingleObserver) method, the Single
 * calls onSubscribe(Cancellable) with a Cancellable that
 * allows cancelling the sequence at any time. A well-behaved
 * Single will call a SingleObserver's onSuccess(Object) method
 * exactly once or the SingleObserver's onError(Error) method
 * exactly once as they are considered mutually exclusive
 * terminal signals.
 *
 * the invocation pattern must adhere to the following protocol:
 *
 * <code>onSubscribe (onSuccess | onError)?</code>
 *
 * Subscribing a SingleObserver to multiple Singles is not recommended.
 * If such reuse happens, it is the duty of the SingleObserver
 * implementation to be ready to receive multiple calls to its methods
 * and ensure proper concurrent behavior of its business logic.
 *
 * Calling onSubscribe(Cancellable), onSuccess(Object) or onError(Error)
 * with a null argument is forbidden.
 * @interface
 */

/* eslint-disable no-unused-vars */

module.exports = Single;
