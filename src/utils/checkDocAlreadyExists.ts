import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

const checkDocAlreadyExists = async (
  firstCollection: string,
  firstID: string,
  nestedCollection: string,
  secondID: string
) => {
  try {
    const userRef = doc(
      db,
      firstCollection,
      firstID,
      nestedCollection,
      secondID
    );

    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return true;
    }
    return false;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

export default checkDocAlreadyExists;
