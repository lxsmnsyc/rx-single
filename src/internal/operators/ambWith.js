import ambArray from './ambArray';
import is from '../is';
/**
 * @ignore
 */
export default (source, other) => {
  if (!(is(other))) {
    return source;
  }
  return ambArray([source, other]);
};
