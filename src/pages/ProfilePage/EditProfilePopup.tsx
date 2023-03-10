import { faClose, faImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import useInput from '../../hooks/useInput';
import { UserProfile } from '../../interfaces/UserProfile';
import getProfilePicUrl from '../../utils/user/getProfilePicUrl';
import updateProfile from '../../utils/user/updateProfile';
import uploadImage from '../../utils/uploadImage';
import ChangeProfileIcon from '../../components/ChangeProfileIcon';
import SubmitButton from '../../components/SubmitButton';
import InputDisplayName from '../../components/InputDisplayName';
import validateProfile from '../../utils/validateProfile';
import setErrorMessage from '../../utils/setErrorMessage';

interface IProps {
  userProfile: UserProfile;
  toggleEditProfilePopup: React.MouseEventHandler<
    HTMLDivElement | HTMLButtonElement
  >;
}

const EditProfilePopup = ({ userProfile, toggleEditProfilePopup }: IProps) => {
  const [displayName, handleDisplayName] = useInput(userProfile.displayName!);
  const [bio, handleBio] = useInput(userProfile.bio || '');
  const [website, handleWebsite] = useInput(userProfile.website || '');
  const [location, handleLocation] = useInput(userProfile.location || '');
  const [selectedBackdrop, setSelectedBackdrop] = useState<File | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [backdropURL, setBackdropURL] = useState(userProfile.backdropURL || '');
  const [photoURL, setPhotoURL] = useState(
    userProfile.photoURL || getProfilePicUrl()
  );
  const [submitting, setSubmitting] = useState(false);

  const handleBackdrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedBackdrop(e.target.files![0]);
    setBackdropURL(URL.createObjectURL(e.target.files![0]));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    // clear errors on new try
    [
      '.verify-display-name',
      '.verify-bio',
      '.verify-location',
      '.verify-website',
      '.verify-pic',
      '.verify-edit',
    ].forEach((item) => setErrorMessage(item, ''));

    try {
      validateProfile({
        bio,
        displayName,
        website,
        location,
        profileImg: selectedPhoto,
        backdropImg: selectedBackdrop,
      });

      let newPhotoURL = photoURL;
      let newBackdropURL = backdropURL;

      if (selectedPhoto) {
        newPhotoURL = await uploadImage(
          `users/${userProfile.id}/icon`,
          selectedPhoto
        );
      }
      if (selectedBackdrop) {
        newBackdropURL = await uploadImage(
          `users/${userProfile.id}/backdrop`,
          selectedBackdrop
        );
      }

      await updateProfile({
        userProfile,
        displayName,
        bio,
        website,
        location,
        backdropURL: newBackdropURL,
        photoURL: newPhotoURL,
      });

      (toggleEditProfilePopup as Function)();
    } catch (er) {
      const error = er as Error;
      const errorName = error.name;
      const errorMessage = error.message;

      let errorCss = '';

      switch (errorName) {
        case 'FirebaseError':
          errorCss = '.verify-edit';
          break;

        case 'DisplayName Error':
          errorCss = '.verify-display-name';
          break;

        case 'Bio Error':
          errorCss = '.verify-bio';
          break;

        case 'Location Error':
          errorCss = '.verify-location';
          break;

        case 'Website Error':
          errorCss = '.verify-website';
          break;

        case 'Pic Error':
          errorCss = '.verify-pic';
          break;

        default:
          console.log(error);
          break;
      }

      setErrorMessage(errorCss, errorMessage);
    }

    setSubmitting(false);
  };

  const nothingChanged =
    displayName === userProfile.displayName &&
    bio === userProfile.bio &&
    website === userProfile.website &&
    location === userProfile.location &&
    photoURL === userProfile.photoURL &&
    backdropURL === userProfile.backdropURL;

  return (
    <>
      <div className='edit-profile'>
        <form onSubmit={handleSubmit}>
          <header className='edit-top'>
            <button
              type='button'
              className='btn-cancel-edit'
              onClick={toggleEditProfilePopup}
            >
              <FontAwesomeIcon icon={faClose} />
            </button>
            <h2>Edit profile</h2>
            <span className='verify-edit error' />
            <SubmitButton
              submitting={submitting}
              text='Save'
              width={100}
              disabled={nothingChanged}
            />
          </header>

          <div className='edit-images'>
            <div className='img-backdrop'>
              {backdropURL && (
                <img src={backdropURL} alt='backdrop' className='img-overlay' />
              )}
              <label htmlFor='backdropURL' className='img-file-upload'>
                <FontAwesomeIcon icon={faImage} />
                <input
                  onChange={handleBackdrop}
                  type='file'
                  name='backdropURL'
                  id='backdropURL'
                  accept='image/jpeg, image/webp'
                />
              </label>
            </div>
            <span className='verify-pic verify error' />

            <ChangeProfileIcon
              photoURL={photoURL}
              selectedPhoto={selectedPhoto}
              setPhotoURL={setPhotoURL}
              setSelectedPhoto={setSelectedPhoto}
            />
          </div>

          <section className='edit-bottom'>
            <InputDisplayName
              displayName={displayName}
              handleDisplayName={handleDisplayName}
            />
            <label htmlFor='bio'>
              Bio <span className='verify-bio verify error' />
              <textarea
                id='bio'
                maxLength={160}
                value={bio}
                onChange={handleBio}
              />
            </label>
            <label htmlFor='location'>
              Location
              <span className='verify-location verify error' />
              <input
                type='text'
                id='location'
                maxLength={30}
                value={location}
                onChange={handleLocation}
              />
            </label>
            <label htmlFor='website'>
              Website
              <span className='verify-website verify error' />
              <input
                type='url'
                id='website'
                maxLength={100}
                value={website}
                onChange={handleWebsite}
              />
            </label>
          </section>
        </form>
      </div>
      <div id='popup-background' onClick={toggleEditProfilePopup} aria-hidden />
    </>
  );
};

export default EditProfilePopup;
