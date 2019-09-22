import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  overviewExplanation: {
    '& b': {
      color: theme.palette.success.dark,
    },

  }
}));


export default useStyles;

