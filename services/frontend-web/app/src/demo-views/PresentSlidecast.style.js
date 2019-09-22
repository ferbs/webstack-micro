import { makeStyles } from '@material-ui/styles';


const useStyles = makeStyles(theme => ({
  isWorking: {
    position: 'fixed',
    top: '1rem',
    left: '1rem',
  },
  isLoadingPreso: {
    margin: '30vh auto',
    width: '20vw',
  },
}));

export default useStyles;
