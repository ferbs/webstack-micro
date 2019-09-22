import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  fullScreenSlideContainer: {
  },
  loadingSpinnerHolder: {
    marginTop: '30vh',
    width: '100%',
    textAlign: 'center',
  },

  slideCastTitle: {
    textAlign: 'center',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    color: theme.palette.success.light,
    '& i': {
      color: theme.palette.success.main,
    },
  },

  fullViewSlideCard: { // passed to Slide component
    maxWidth: theme.breakpoints.values.md,
    marginLeft: 'auto',
    marginRight: 'auto',
  }
}));

export default useStyles;
