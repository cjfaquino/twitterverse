import checkDocAlreadyExists from '../checkDocAlreadyExists';
import getUserUid from '../getUserUid';
import isUserSignedIn from '../isUserSignedIn';

const checkAlreadyFollowing = async (targetID: string) => {
  if (isUserSignedIn()) {
    return checkDocAlreadyExists('users', getUserUid(), 'following', targetID);
  }
  return false;
};

export default checkAlreadyFollowing;