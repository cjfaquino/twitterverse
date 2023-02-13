import React, { useLayoutEffect, useState } from 'react';
import ProfileSmall from './ProfileSmall';
import ProfileMedium from './ProfileMedium';
import { UserProfile } from '../interfaces/UserProfile';

interface IProps {
  users: UserProfile[];
  compact?: boolean;
  missingText?: string;
}

const defaultProps = {
  compact: false,
  missingText: "There's no users here",
};

const ListOfUsers = ({
  users,
  compact,
  missingText,
}: IProps & typeof defaultProps) => {
  const [empty, setEmpty] = useState(false);

  useLayoutEffect(() => {
    let timer: NodeJS.Timeout;
    if (users.length === 0) {
      timer = setTimeout(() => {
        setEmpty(true);
      }, 500);
    }
    return () => {
      clearInterval(timer);
      setEmpty(false);
    };
  }, [users]);

  return (
    <div className='list'>
      {empty && <div className='missing'>{missingText}</div>}
      {compact
        ? users.map((usr) => (
            <ProfileSmall key={`profile-small-${usr.id}`} userProfile={usr} />
          ))
        : users.map((usr) => (
            <ProfileMedium key={`profile-medium-${usr.id}`} userProfile={usr} />
          ))}
    </div>
  );
};

ListOfUsers.defaultProps = defaultProps;

export default ListOfUsers;
