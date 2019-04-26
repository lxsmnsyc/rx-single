import ambArray from './ambArray';
import is from '../is';
/**
 * @ignore
 */
export default (source, other) => (
  !is(other)
    ? source
    : ambArray([source, other])
);
