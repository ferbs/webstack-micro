import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%'
  },
  grid: {
    height: '100%'
  },
  name: {
    marginTop: theme.spacing(3),
    color: theme.palette.white
  },
  contentContainer: {},
  content: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  contentHeader: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  logoImage: {
    marginLeft: theme.spacing(4)
  },
  contentBody: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'center'
    }
  },
  form: {
    marginTop: theme.spacing(3),
    paddingBottom: 125,
    flexBasis: 700,
    // [theme.breakpoints.down('sm')]: {
    //   paddingLeft: theme.spacing(2),
    //   paddingRight: theme.spacing(2)
    // }
  },
  formLevelError: {
    padding: '1rem',
  },
  divider: {
    marginTop: theme.spacing(4),
  },
  socialButtons: {
    marginTop: theme.spacing(3),
  },
  socialIcon: {
    marginRight: theme.spacing(1)
  },

  signInButton: {
    margin: theme.spacing(2, 0)
  },

  devModeLocalSigninTips: {
    marginTop: theme.spacing(3)
  }
}));

export default useStyles;