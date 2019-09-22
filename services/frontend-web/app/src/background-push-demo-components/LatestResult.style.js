import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  resultsArea: {
   '& pre': {
     width: '60vw',
     margin: '0 auto',
   },
  },
  noResultsYet: {
    color: theme.palette.success.dark,
  }
}));


export default useStyles;

