import { makeStyles } from '@material-ui/styles';


const useStyles = makeStyles(theme => ({
  contrastText: {
    color: theme.palette.primary.contrastText
  },
}));

export default useStyles;