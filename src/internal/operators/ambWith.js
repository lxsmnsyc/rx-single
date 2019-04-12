
import Single from '../../single';
import amb from './amb';
/**
 * @ignore
 */
export default (source, other) => {
  if (!(other instanceof Single)) {
    return source;
  }
  return amb([source, other]);
};
