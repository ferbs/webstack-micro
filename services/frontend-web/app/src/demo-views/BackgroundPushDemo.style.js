import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  backgroundPushDemo: {
    '& li,p': {
      fontSize: '1rem',
      lineHeight: '1.5rem',
    },
    '& li': {
      marginTop: '0.6rem',
    },
  },
  tryItArea: {
    width: '80vw',
    margin: '2rem auto',
  },
}));


export default useStyles;

