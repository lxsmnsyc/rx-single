/* eslint-disable class-methods-use-this */
import { UNCANCELLED } from 'rx-cancellable';
import Single from '../../single';
import { isNull } from '../utils';
/**
 * @ignore
 */
let INSTANCE;
/**
 * @ignore
 */
export default () => {
  if (isNull(INSTANCE)) {
    INSTANCE = new Single(o => o.onSubscribe(UNCANCELLED));
  }
  return INSTANCE;
};
