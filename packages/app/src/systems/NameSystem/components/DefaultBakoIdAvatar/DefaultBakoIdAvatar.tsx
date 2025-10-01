import { Avatar, type AvatarProps } from '@fuel-ui/react';
import { memo } from 'react';
import Bako from '../../assets/svg/bako.svg';

interface DefaultBakoIdAvatarProps extends Omit<AvatarProps, 'src'> {}

export const DefaultBakoIdAvatar = memo(
  ({ name, size = 'sm', ...props }: DefaultBakoIdAvatarProps) => {
    return <Avatar name={name} src={Bako} size={size} {...props} />;
  }
);
