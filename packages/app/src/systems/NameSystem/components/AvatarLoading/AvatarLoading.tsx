import { cssObj } from '@fuel-ui/css';
import { Box, type BoxProps, ContentLoader } from '@fuel-ui/react';

export const AvatarLoading = (props: BoxProps) => {
  return (
    <Box css={styles.root} {...props}>
      <ContentLoader className="loader">
        <ContentLoader.Rect width={'100%'} height={'100%'} />
      </ContentLoader>
    </Box>
  );
};

const styles = {
  root: cssObj({
    borderRadius: '$full',
    width: '$8',
    height: '$8',

    '.loader': {
      borderRadius: '$full',
      width: '$full',
      height: '$full',
    },
  }),
};
