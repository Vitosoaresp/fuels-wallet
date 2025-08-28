import { cssObj } from '@fuel-ui/css';
import { Box, type BoxProps, ContentLoader } from '@fuel-ui/react';

export const AvatarLoading = (props: BoxProps) => {
  return (
    <Box css={styles.root} {...props}>
      <ContentLoader className="loader">
        <ContentLoader.Rect width={32} height={32} />
      </ContentLoader>
    </Box>
  );
};

const styles = {
  root: cssObj({
    borderRadius: '$lg',
    width: '$8',
    height: '$8',

    '.loader': {
      borderRadius: '$lg',
      width: '$8',
      height: '$8',
    },
  }),
};
