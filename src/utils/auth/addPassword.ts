import {
  AuthError,
  EmailAuthProvider,
  linkWithCredential,
  User,
} from 'firebase/auth';

export default async (
  user: User,
  email: string,
  password: string,
  toggleLoginPopup: Function
) => {
  try {
    const credential = EmailAuthProvider.credential(email, password);

    await linkWithCredential(user, credential);

    return true;
  } catch (error) {
    const errorCode = (error as AuthError).code;
    // error
    switch (errorCode) {
      case 'auth/requires-recent-login':
        toggleLoginPopup();
        break;

      default:
        break;
    }
    return errorCode;
  }
};
