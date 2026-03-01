// components/media_player/Player/Video/styles.ts
import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles(
  (theme) => ({
    root: {
      '& > video': {
        width: '100%',
      },
    },
  }),
  { name: 'Video' },
);
