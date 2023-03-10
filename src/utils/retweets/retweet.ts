import {
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import eventProfileEdit from '../../events/eventProfileEdit';
import { db } from '../../firebase-config';
import { TweetObj } from '../../interfaces/TweetObj';
import saveTweet from '../tweets/saveTweet';
import getUserUid from '../user/getUserUid';

export default async (tweetObj: TweetObj) => {
  // create new tweet
  const [docID, , tweetError] = await saveTweet({
    messageText: '',
    aRetweetOf: tweetObj,
  });

  if (docID) {
    // create retweet pointer in users>retweets
    const userRef = doc(db, 'users', getUserUid(), 'retweets', tweetObj.id);
    setDoc(userRef, {
      retweet_ID: docID,
      USER_ID: getUserUid(),
      retweetedAt: serverTimestamp(),
    });

    // increment original tweets retweet by 1
    const tweetsRetweetsRef = doc(db, 'tweets', tweetObj.id);
    updateDoc(tweetsRetweetsRef, { retweets: increment(1) });

    eventProfileEdit();
    return docID;
  }

  if (tweetError) {
    throw tweetError;
  }

  return undefined;
};
