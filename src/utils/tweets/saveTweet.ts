import { collection, addDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { indexTweets } from '../../algolia-config';
import { db } from '../../firebase-config';
import tweetConverter from './tweetConverter';
import replyConverter from './replyConverter';
import uploadImage from '../uploadImage';
import { TweetObj } from '../../interfaces/TweetObj';
import Tweet from '../../classes/Tweet';
import getUserUid from '../user/getUserUid';
import retweetConverter from '../retweets/retweetConverter';

interface IArgs {
  messageText?: string;
  messageImgFile?: File | null;
  aReplyTo?: TweetObj | null;
  aRetweetOf?: TweetObj | null;
}

// Save all tweets to tweets doc

const saveTweet = async ({
  messageText = '',
  messageImgFile = null,
  aReplyTo = null,
  aRetweetOf = null,
}: IArgs): Promise<[string | null, string | null, Error | null]> => {
  try {
    // ref for original tweet
    const tweetRef = collection(db, 'tweets').withConverter(tweetConverter);

    let tweet = new Tweet({ messageText, aReplyTo, aRetweetOf });
    let docRef;

    if (aRetweetOf) {
      // create new tweet
      docRef = await addDoc(tweetRef, tweet);

      // add to aRetweetOf's retweets collection
      const retweetRef = doc(
        db,
        'tweets',
        aRetweetOf.id,
        'retweets',
        docRef.id
      ).withConverter(retweetConverter);

      setDoc(retweetRef, tweet);
    } else if (aReplyTo) {
      // if is a reply
      // create new tweet
      docRef = await addDoc(tweetRef, tweet);

      // add to aReplyTo's replies collection pointing to original
      const replyRef = doc(
        db,
        'tweets',
        aReplyTo.id,
        'replies',
        docRef.id
      ).withConverter(replyConverter);
      setDoc(replyRef, tweet);
    } else {
      // create normal tweet
      tweet = { ...tweet, aReplyTo };
      docRef = await addDoc(tweetRef, tweet);
    }

    let uploadedURL = null;
    if (messageImgFile) {
      // upload img if available
      uploadedURL = await uploadImage(
        `/users/${getUserUid()}/tweets/${docRef.id}/image`,
        messageImgFile
      );

      // update tweetObj with url
      updateDoc(docRef, { imgURL: uploadedURL });
    }

    if (!aRetweetOf) {
      // add to algolia 'tweets' index only if not a retweet
      const timeInSeconds = new Date().getTime() / 1000;
      indexTweets.saveObject({
        ...tweet,
        objectID: docRef.id,
        id: docRef.id,
        timestamp: { seconds: timeInSeconds },
      });
    }

    // return firebase doc id
    return [docRef.id, uploadedURL, null];
  } catch (er) {
    const error = er as Error;
    console.error('Error writing new tweet to Firebase Database', error);
    return [null, null, error];
  }
};

export default saveTweet;
