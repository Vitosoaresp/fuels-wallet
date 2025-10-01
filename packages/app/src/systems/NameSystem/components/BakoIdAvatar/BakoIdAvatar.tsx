import { cssObj } from '@fuel-ui/css';
import { Box, Image, type ImageProps } from '@fuel-ui/react';
import { memo, useState } from 'react';
import { AvatarLoading } from '../AvatarLoading';

interface BakoIdAvatarProps extends Omit<ImageProps, 'src'> {
  src: string;
  size?: string | number;
}

export const BakoIdAvatar = memo(
  ({ alt, src, size, ...props }: BakoIdAvatarProps) => {
    const [isLoading, setIsLoading] = useState(true);

    return (
      <Box
        css={styles.rootLoading}
        style={size ? { width: size, height: size } : undefined}
        className="fuel_Avatar"
      >
        <AvatarLoading
          className="avatar_loading"
          style={{ display: isLoading ? 'block' : 'none' }}
        />
        <Image
          src={src}
          alt={alt}
          css={styles.bakoAvatar}
          style={{ display: isLoading ? 'none' : 'block' }}
          onLoad={() => setIsLoading(false)}
          {...props}
        />
      </Box>
    );
  }
);

const styles = {
  rootLoading: cssObj({
    borderRadius: '$full',
    width: '$8',
    height: '$8',

    '.avatar_loading': {
      width: '$full',
      height: '$full',
    },
  }),
  bakoAvatar: cssObj({
    borderRadius: '$full',
    width: '$full',
    height: '$full',
    objectFit: 'cover',
  }),
};
