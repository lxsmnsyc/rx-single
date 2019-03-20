import { neverDisposed } from '../utils';
import Single from '../../single';

function subscribeActual(observer) {
  observer.onSubscribe(neverDisposed);
}

const never = () => {
  const single = new Single();
  single.subscribeActual = subscribeActual.bind(single);
  return single;
};

export default never;
