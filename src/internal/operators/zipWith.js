import Single from '../../single';
import zip from './zip';

/**
 * @ignore
 */
export default (source, other, zipper) => {
  if (!(other instanceof Single)) {
    return source;
  }
  return zip([source, other], zipper);
};
