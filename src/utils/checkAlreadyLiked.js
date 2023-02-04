import checkDocAlreadyExists from './checkDocAlreadyExists';
import getUserUid from './getUserUid';
import isUserSignedIn from './isUserSignedIn';

const checkAlreadyLiked = async (tweetID) => {
  if (isUserSignedIn()) {
    return checkDocAlreadyExists('users', getUserUid(), 'likes', tweetID);
  }
  return false;
};

export default checkAlreadyLiked;
