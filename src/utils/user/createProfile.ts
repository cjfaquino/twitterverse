import { doc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../../firebase-config';
import getProfilePicUrl from './getProfilePicUrl';
import updateDisplayNameAndPhoto from './updateDisplayNameAndPhoto';
import eventProfileEdit from '../../events/eventProfileEdit';
import { indexUsers } from '../../algolia-config';

interface CreateProfile {
  user: User;
  userName: string;
  displayName: string;
  photoURL?: string;
}

const createProfile = async ({
  user,
  userName,
  displayName,
  photoURL = getProfilePicUrl(),
}: CreateProfile) => {
  // update firebase auth user
  const profilePromise = updateDisplayNameAndPhoto({ displayName, photoURL });

  // save new profile to firestore 'users' collection
  const userRef = doc(db, 'users', user.uid);

  const newUser = {
    userName,
    displayName,
    photoURL,
    metadata: { ...user.metadata },
    followers: 0,
    following: 0,
    backdropURL: '',
    bio: '',
    location: '',
    website: '',
  };
  const firestorePromise = setDoc(userRef, newUser);

  // save new profile to algolia 'users' index
  const algoliaPromise = indexUsers.saveObject({
    ...newUser,
    objectID: user.uid,
  });

  await Promise.all([profilePromise, firestorePromise, algoliaPromise]);

  // dispatch event 'profile edit'
  eventProfileEdit();
};

export default createProfile;
