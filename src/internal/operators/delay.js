import Single from '../../single';

function subscribeActual(observer) {
  const { onSuccess, onError, onSubscribe } = observer;

  const { amount, doDelayError } = this;

  this.source.subscribeWith({
    onSubscribe,
    onSuccess(x) {
      setTimeout(onSuccess, amount, x);
    },
    onError(x) {
      setTimeout(onError, amount, doDelayError ? x : 0);
    },
  });
}

const delay = (source, amount, doDelayError) => {
  if (typeof amount !== 'number') {
    return source;
  }
  const single = new Single();
  single.source = source;
  single.amount = amount;
  single.doDelayError = doDelayError;
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default delay;
