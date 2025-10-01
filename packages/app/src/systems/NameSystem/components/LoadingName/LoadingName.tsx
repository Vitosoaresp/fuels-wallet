import { cssObj } from '@fuel-ui/css';
import { Box, ContentLoader } from '@fuel-ui/react';

interface LoadingNameProps {
  isLoaded: boolean;
  fallbackName?: string;
  name?: string | null;
}

export const LoadingName = ({
  isLoaded,
  fallbackName,
  name,
}: LoadingNameProps) => {
  if (!isLoaded) {
    return (
      <Box css={styles.root}>
        <ContentLoader className="loader">
          <ContentLoader.Rect width={100} height={20} />
        </ContentLoader>
      </Box>
    );
  }

  return <>{name || fallbackName}</>;
};

const styles = {
  root: cssObj({
    borderRadius: '$md',
    width: '100px',
    height: '20px',

    '.loader': {
      borderRadius: '$md',
      width: '$full',
      height: '$full',
    },
  }),
};
