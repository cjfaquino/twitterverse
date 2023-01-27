import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import updateDisplayNameOrPhoto from './updateDisplayNameOrPhoto';

const createProfile = async (user, userName, displayName, photoUrl) => {
  try {
    // update firebase user
    await updateDisplayNameOrPhoto(displayName, photoUrl);

    // create firestore profile
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      userName,
      displayName,
      photoUrl,
      bio: '',
    });

    return user.uid;
  } catch (error) {
    console.error('Error writing new message to Firebase Database', error);
    return false;
  }
};

export default createProfile;
