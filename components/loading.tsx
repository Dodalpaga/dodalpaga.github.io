// components/loading.tsx
import { Skeleton, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled container for the skeleton
const SkeletonContainer = styled(Stack)(({ theme }) => ({
  width: '100%',
  height: '100%',
  padding: theme.spacing(2),
  justifyContent: 'center',
  alignItems: 'center',
}));

const Loading = () => {
  return (
    <SkeletonContainer spacing={1} direction="column">
      <Skeleton variant="rectangular" width="100%" height={200} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
    </SkeletonContainer>
  );
};

export default Loading;
