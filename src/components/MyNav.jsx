import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { signOutUser, isUserSignedIn } from '../firebase';
import useToggle from '../hooks/useToggle';
import ThreeDots from './ThreeDots';

function MyNav({ currentUser, toggleTweetPopup }) {
  const [logoutPopup, toggleLogoutPopup] = useToggle();

  const handleClick = () => {
    if (isUserSignedIn()) {
      // show tweet popup
      toggleTweetPopup();
    } else {
      // show login popup
    }
  };

  const handleSignOut = () => {
    signOutUser();
    toggleLogoutPopup();
  };

  return (
    <nav id='menubar'>
      <ul className='menu-list'>
        <li className='nav-home'>
          <Link to='/'>Home</Link>
        </li>
        <li className='nav-settings'>
          <Link to='/settings'>Settings</Link>
        </li>

        <li>
          <button type='button' onClick={handleClick} className='btn-nav-tweet'>
            Tweet
          </button>
        </li>
        <li className='nav-user'>
          {currentUser && (
            <>
              <div
                className='nav-user-item'
                onClick={toggleLogoutPopup}
                aria-hidden='true'
              >
                <div className='nav-user-img-container'>
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName}
                  />
                </div>
                <div>{currentUser.displayName}</div>
                <ThreeDots />
              </div>
              {logoutPopup && (
                <>
                  <div
                    className='options-background'
                    onClick={toggleLogoutPopup}
                    aria-hidden='true'
                  />
                  <div className='nav-options-popup popup'>
                    <button
                      type='button'
                      onClick={handleSignOut}
                      className='btn-nav-logout'
                    >
                      Log Out {currentUser.displayName}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </li>
      </ul>
    </nav>
  );
}

MyNav.propTypes = {
  currentUser: PropTypes.shape({
    displayName: PropTypes.string,
    photoURL: PropTypes.string,
  }),
  toggleTweetPopup: PropTypes.func.isRequired,
};

MyNav.defaultProps = {
  currentUser: { displayName: '' },
};

export default MyNav;
