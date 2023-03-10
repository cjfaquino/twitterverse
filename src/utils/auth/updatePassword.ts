import { AuthError, updatePassword, User } from 'firebase/auth';

export default async (
  user: User,
  newPass: string,
  toggleLoginPopup: Function
) => {
  try {
    await updatePassword(user, newPass);

    return true;
  } catch (error: unknown) {
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
