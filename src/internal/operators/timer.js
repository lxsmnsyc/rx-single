import Single from '../../single';
import { cleanObserver, isNumber, defaultScheduler } from '../utils';
import error from './error';

/**
 * @ignore
 */
function subscribeActual(observer) {
  const { onSuccess, onSubscribe } = cleanObserver(observer);
  onSubscribe(this.scheduler.delay(() => onSuccess(0), this.amount));
}
/**
 * @ignore
 */
export default (amount, scheduler) => {
  if (!isNumber(amount)) {
    return error(new Error('Single.timer: "amount" is not a number.'));
  }
  const single = new Single(subscribeActual);
  single.amount = amount;
  single.scheduler = defaultScheduler(scheduler);
  return single;
};
