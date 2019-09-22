import { makeStyles } from '@material-ui/styles';


const useStyles = makeStyles(theme => ({
  root: {
    boxShadow: 'none',
  },
  contrastText: {
    color: theme.palette.primary.contrastText
  },
  navItems: {
    flexGrow: 1,
    display: 'flex',

    // listStyleType: 'none',
    justifyContent: 'flex-end',
  },
  navItem: {

    listStyleType: 'none',
  },
}));

export default useStyles;