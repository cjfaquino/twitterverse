import React from 'react';
import PropTypes from 'prop-types';
import { checkMatchingUser } from '../firebase';
import deleteReply from '../utils/deleteReply';
import deleteTweetFromDOM from '../utils/deleteTweetFromDOM';
import useToggle from '../utils/useToggle';
import ThreeDots from './ThreeDots';
import getTimeString from '../utils/getTimeString';

function ReplyItem({ replyObj, TWEET_ID }) {
  const { text, timestamp, USER_ICON, USER_NAME, USER_ID } = replyObj.data;
  const { id: REPLY_ID } = replyObj;
  const [showOptionsPopup, toggleOptionsPopup] = useToggle();

  const handleDelete = async () => {
    if (checkMatchingUser(USER_ID)) {
      await deleteReply(TWEET_ID, REPLY_ID);
      deleteTweetFromDOM(REPLY_ID);
    }
  };

  const customClass = 'reply';

  return (
    <div className={`${customClass}-item`} id={REPLY_ID}>
      <div className={`${customClass}-item-img-container`}>
        <img src={USER_ICON} alt={USER_NAME} />
      </div>

      <div className={`${customClass}-item-right-half`}>
        <div className={`${customClass}-item-info`}>
          <div className={`${customClass}-item-name`}>{USER_NAME}</div>
          <div
            className={`${customClass}-item-time`}
            title={getTimeString(timestamp)}
          >
            {getTimeString(timestamp, 'localeDate')}
          </div>
          <div
            className='dots-container'
            onClick={toggleOptionsPopup}
            aria-hidden='true'
          >
            <ThreeDots />
            {showOptionsPopup && (
              <>
                <div className='options-popup'>
                  {checkMatchingUser(USER_ID) && (
                    <button
                      className='btn-delete-tweet'
                      type='button'
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className='options-background' aria-hidden='true' />
              </>
            )}
          </div>
        </div>
        <div className={`${customClass}-item-message`}>{text}</div>
        <div className={`${customClass}-item-buttons`}>
          <span>stats</span> <span>retweet</span> <span>like</span>
          <span>share</span>
        </div>
      </div>
    </div>
  );
}

ReplyItem.propTypes = {
  replyObj: PropTypes.shape({
    data: PropTypes.shape({
      text: PropTypes.string,
      timestamp: PropTypes.shape({
        toDate: PropTypes.func,
      }),
      USER_ICON: PropTypes.string,
      USER_ID: PropTypes.string,
      USER_NAME: PropTypes.string,
    }),
    id: PropTypes.string,
  }),
  TWEET_ID: PropTypes.string.isRequired,
};

ReplyItem.defaultProps = {
  replyObj: null,
};

export default ReplyItem;
