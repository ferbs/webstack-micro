
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  statusMessage: {
    float: 'right',
    textAlign: 'center',
    color: '#555',
    margin: '0.5rem',
    '& svg': {
      fontSize: '1.5rem',
    },
    '& p': {
      fontSize: '0.5rem',
      margin: 0,
      lineHeight: 'unset',
    },
  }
}));


export default useStyles;

