import getUserUid from './getUserUid';
import isUserSignedIn from './isUserSignedIn';

// Returns true if matching users

const checkMatchingUser = (userID: string) => {
  if (!isUserSignedIn()) return false;
  return getUserUid() === userID;
};

export default checkMatchingUser;
