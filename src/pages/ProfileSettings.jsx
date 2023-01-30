import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import useInput from '../hooks/useInput';
import updateProfile from '../utils/updateProfile';
import eventProfileEdit from '../utils/eventProfileEdit';
import doesProfileExist from '../utils/doesProfileExist';
import updateUserEmail from '../utils/updateEmail';
import linkWithGooglePopup from '../utils/linkWithGooglePopup';
import isEmailVerified from '../utils/isEmailVerified';
import sendEmailVerification from '../utils/sendEmailVerification';

function ProfileSettings({ currentUser, userProfile }) {
  const [displayName, handleDisplayName, setDisplayName] = useInput();
  const [userName, handleUserName, setUserName] = useInput();
  const [email, handleEmail, setEmail] = useInput();
  const [loading, setLoading] = useState(true);
  const [submittingProfile, setSubmittingProfile] = useState(null);
  const [submittingEmail, setSubmittingEmail] = useState(null);
  const navigate = useNavigate();

  const handleSubmit1 = async (e) => {
    e.preventDefault();
    setSubmittingProfile(true);
    // create profile
    const userID = await updateProfile({
      user: currentUser,
      userName,
      displayName,
    });
    setSubmittingProfile(false);
    if (userID) {
      // makes useUserProfile grab the new profile
      eventProfileEdit();
    } else {
      // error
    }
  };

  const handleSubmit2 = async (e) => {
    e.preventDefault();
    setSubmittingEmail(true);
    const res = await updateUserEmail(email);
    setSubmittingEmail(false);

    if (res === 'auth/requires-recent-login') {
      navigate('/login', { state: { error: 'reauth' } });
    }
  };

  const setFields = async () => {
    // update inputs if data is available
    setDisplayName(currentUser.displayName);
    setEmail(currentUser.email || '');

    if (userProfile) {
      setUserName(userProfile.userName);
      setLoading(false);
    } else if (!(await doesProfileExist(currentUser.uid))) {
      // no user profile in db
      setLoading(false);
    }
  };

  const linkGoogle = async () => {
    await linkWithGooglePopup('github');
  };

  useEffect(() => {
    // must be signed in
    // User session expired, needs to reauthenticate
    if (!currentUser || currentUser.isAnonymous) {
      return navigate('/login');
    }

    setFields();
    return undefined;
  }, [userProfile]);

  return (
    <div id='settings'>
      {!loading && (
        <div className='sign-up-form'>
          <form onSubmit={handleSubmit1}>
            <h3>Your Profile</h3>
            <label htmlFor='displayName'>
              Display Name
              <input
                type='text'
                id='displayName'
                value={displayName}
                onChange={handleDisplayName}
              />
            </label>
            <label htmlFor='userName'>
              Username
              <input
                type='text'
                id='userName'
                value={userName}
                onChange={handleUserName}
              />
            </label>
            <button type='submit'>
              {submittingProfile ? 'Submitting...' : 'Submit'}
            </button>
          </form>
          <form onSubmit={handleSubmit2} className='email-form'>
            <h3>Contact Details</h3>
            <label htmlFor='email'>
              Email{' '}
              <span
                className={
                  isEmailVerified() ? 'verify-email verified' : 'verify-email'
                }
              >
                {isEmailVerified() ? 'verified ✓' : 'not verified'}
              </span>
              <input
                type='text'
                id='email'
                value={email}
                onChange={handleEmail}
              />
            </label>
            <button type='button' onClick={sendEmailVerification}>
              Verify email
            </button>
            <button type='submit'>
              {submittingEmail ? 'Submitting...' : 'Submit'}
            </button>
          </form>

          <div className='link-google-account'>
            <button type='button' onClick={linkGoogle}>
              Link Google
            </button>
            <span className='error' />
          </div>

          <div className='account-stats'>
            <div>
              <span>Created at: </span>{' '}
              <span>
                {currentUser &&
                  new Date(
                    Number(currentUser.metadata.createdAt)
                  ).toLocaleString()}
              </span>
            </div>
            <div>
              <span>Last login at: </span>{' '}
              <span>
                {currentUser &&
                  new Date(
                    Number(currentUser.metadata.lastLoginAt)
                  ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ProfileSettings.propTypes = {
  currentUser: PropTypes.shape({
    metadata: PropTypes.shape({
      createdAt: PropTypes.string,
      lastLoginAt: PropTypes.string,
    }),
    displayName: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
    uid: PropTypes.string,
    isAnonymous: PropTypes.bool,
  }),
  userProfile: PropTypes.shape({
    userName: PropTypes.string,
  }),
};

ProfileSettings.defaultProps = {
  currentUser: null,
  userProfile: null,
};

export default ProfileSettings;