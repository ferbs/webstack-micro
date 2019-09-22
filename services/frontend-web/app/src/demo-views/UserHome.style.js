import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  authUserInfo: {
    marginTop: theme.spacing(3),
    textAlign: 'center',
  },
  textIcon: {
    position: 'relative',
    top: '5px',
  },
}));


export default useStyles;