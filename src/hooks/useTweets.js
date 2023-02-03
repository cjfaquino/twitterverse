import { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase-config';

export default function useTweets(filter, userID) {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);

  let count = 0;

  useEffect(() => {
    const queryRef = query(
      collection(db, 'tweets'),
      orderBy('timestamp', 'desc')
    );

    count += 1;

    if (count > 1) return undefined;

    getDocs(queryRef)
      .then((qSnap) => {
        qSnap.forEach((item) => {
          if (
            filter === 'user tweets' &&
            userID &&
            item.data().USER_ID === userID &&
            item.data().aReplyTo === null
          ) {
            setTweets((prev) => [...prev, { id: item.id, ...item.data() }]);
          }

          if (
            filter === 'user tweets&replies' &&
            userID &&
            item.data().USER_ID === userID
          ) {
            setTweets((prev) => [...prev, { id: item.id, ...item.data() }]);
          }

          if (
            filter === 'tweets' &&
            item.data().aReplyTo === null &&
            !tweets.some((twt) => twt.id === item.id)
          )
            setTweets((prev) => [...prev, { id: item.id, ...item.data() }]);
        });
      })
      .catch((e) => console.error(e));

    setLoading(false);

    return () => {
      setTweets([]);
    };
  }, [filter, userID]);

  // add temp tweet to DOM
  const addTweetToDOM = (tweetObj) => {
    setTweets((prev) => [tweetObj, ...prev]);
  };

  return [tweets, addTweetToDOM, loading];
}
