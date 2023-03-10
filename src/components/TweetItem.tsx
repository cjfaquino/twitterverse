import React, { useContext, useLayoutEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { faRetweet } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import deleteTweet from '../utils/tweets/deleteTweet';
import OptionsPopup from './OptionsPopup';
import useToggle from '../hooks/useToggle';
import getTimeString from '../utils/formatters/getTimeString';
import checkMatchingUser from '../utils/user/checkMatchingUser';
import useReplies from '../hooks/useReplies';
import FormattedText from './FormattedText';
import useFindByUsername from '../hooks/useFindByUsername';
import { TweetObj } from '../interfaces/TweetObj';
import ProfileContext from '../context/ProfileContext';
import { UserProfile } from '../interfaces/UserProfile';
import getUpdatedTweetByID from '../utils/tweets/getUpdatedTweetByID';
import getUpdatedUserByID from '../utils/user/getUpdatedUserByID';
import getContents from '../utils/tweets/getContents';
import TweetHandlerContext from '../context/TweetHandlerContext';
import WithProfilePopup from './WithProfilePopup';
import TweetItemSocials from './TweetItemSocials';

interface IProps {
  tweetObj: TweetObj;
}

const TweetItem = ({ tweetObj }: IProps) => {
  const [likes, setLikes] = useState(tweetObj.likes);
  const [retweets, setRetweets] = useState(tweetObj.retweets);
  const [views, setViews] = useState(tweetObj.views);
  const targetUser = useFindByUsername(
    (tweetObj.aRetweetOf && tweetObj.aRetweetOf.USER_NAME) || tweetObj.USER_NAME
  );
  const [showOptionsPopup, toggleOptionsPopup] = useToggle(false);
  const [replies, repliesLoading] = useReplies(
    (tweetObj.aRetweetOf && tweetObj.aRetweetOf.id) || tweetObj.id
  );
  const [retwt, setRetwt] = useState<TweetObj | null>(null);
  const [retweeter, setRetweeter] = useState<UserProfile | null>(null);
  const userProfile: UserProfile = useContext(ProfileContext);
  const tweetHandler = useContext(TweetHandlerContext);
  const navigate = useNavigate();

  const {
    text,
    imgURL,
    timestamp,
    USER_ID,
    id: TWEET_ID,
  } = getContents(tweetObj);

  const customClass = 'tweet';

  const handleDelete = async () => {
    // delete from DB
    if (checkMatchingUser(USER_ID)) {
      await deleteTweet(tweetObj);

      tweetHandler.delete(TWEET_ID);
    }
  };

  const checkElementClicked = (targetString: string, conditions: string[]) =>
    conditions.some((el) => targetString.includes(el));

  const navToPage = async (e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.target as HTMLDivElement;

    // prevent errors when svg, path is selected
    if (element.tagName === 'svg' || element.tagName === 'path') return;
    const targetName = element.className;

    // conditions
    const toUser = ['profile-link'];
    const toTweetPage = [
      'info',
      'right-half',
      'left-half',
      'message',
      'time',
      'buttons',
      'repl',
    ];

    if (checkElementClicked(targetName, toTweetPage)) {
      // go to tweet page
      navigate(`/${targetUser.userProfile.userName}/tweet/${TWEET_ID}`);
    } else if (checkElementClicked(targetName, toUser)) {
      // go to user page
      navigate(`/${targetUser.userProfile.userName}`);
    }
  };

  useLayoutEffect(() => {
    if (tweetObj.aRetweetOf && retwt === null) {
      // get updated stats of original tweet
      getUpdatedTweetByID(tweetObj.aRetweetOf.id).then((data) => {
        const twt = data as TweetObj;
        setRetwt(twt);
        setLikes(twt.likes);
        setViews(twt.views);
        setRetweets(twt.retweets);
      });

      // get updated info for the retweeter
      getUpdatedUserByID(tweetObj.USER_ID).then((data) =>
        setRetweeter(data as UserProfile)
      );
    }
  }, [tweetObj]);

  if (TWEET_ID.startsWith('null') || retwt?.id.startsWith('null')) {
    // prevent app from crashing when trying to load a tweet that doesn't exist
    // or hide retweets when original is deleted

    // TODO delete all retweets of deleted tweet
    return null;
  }

  return (
    <div
      className={`${customClass}-item`}
      id={`${customClass}-${TWEET_ID}`}
      onClick={navToPage}
      aria-hidden
    >
      {targetUser.doneLoading && !repliesLoading && (
        <>
          <section className={`${customClass}-item-left-half`}>
            <WithProfilePopup
              userProfile={targetUser.userProfile}
              type='profile-icon'
            >
              <div
                className={`${customClass}-item-img-container img-container profile-link`}
              >
                <img
                  src={targetUser.userProfile.photoURL}
                  alt=''
                  className='profile-link'
                />
              </div>
            </WithProfilePopup>
            <div className='vert-line' />
          </section>

          <section className={`${customClass}-item-right-half`}>
            {retweeter && (
              <Link
                to={`/${retweeter.userName}`}
                className='retweeter-name grey'
              >
                <span>
                  <FontAwesomeIcon icon={faRetweet} />
                </span>
                {`${retweeter.displayName} Retweeted`}
              </Link>
            )}

            <div className={`${customClass}-item-info`}>
              <WithProfilePopup
                userProfile={targetUser.userProfile}
                type='display-name'
              >
                {targetUser.userProfile.displayName}
              </WithProfilePopup>
              <WithProfilePopup
                userProfile={targetUser.userProfile}
                type='username'
                grey
              >
                @{targetUser.userProfile.userName}
              </WithProfilePopup>
              <div
                className={`${customClass}-item-time grey`}
                title={getTimeString(timestamp)}
              >
                {getTimeString(timestamp, 'localeDate')}
              </div>
              <OptionsPopup
                toggleOptionsPopup={toggleOptionsPopup}
                showOptionsPopup={showOptionsPopup}
                handleDelete={handleDelete}
                targetUser={targetUser}
              />
            </div>
            {tweetObj.aReplyTo && !tweetObj.aReplyTo.id.startsWith('null') && (
              <div className='replying-to-info'>
                {'Replying to '}
                <Link
                  to={`/${tweetObj.aReplyTo.USER_NAME}`}
                  className='username-link'
                >
                  @{tweetObj.aReplyTo.USER_NAME}
                </Link>
              </div>
            )}
            <FormattedText
              text={text}
              itemID={TWEET_ID}
              customClass={customClass}
            />
            {imgURL && (
              <div className='tweet-img-container'>
                <img src={imgURL} alt='' />
              </div>
            )}
            <TweetItemSocials
              customClass={customClass}
              tweetObj={tweetObj.aRetweetOf || tweetObj}
              targetUser={targetUser}
              userProfile={userProfile}
              replies={replies}
              likes={likes}
              views={views}
              retweets={retweets}
              setLikes={setLikes}
              setRetweets={setRetweets}
            />
          </section>
        </>
      )}
    </div>
  );
};

export default TweetItem;
