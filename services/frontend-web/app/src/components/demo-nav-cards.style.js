import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  navCardList: {
    // display: 'flex',
  },
  mainGridItem: {
    alignSelf: 'stretch',
  },
  demoCard: {
    marginTop: theme.spacing(3),
    // display: 'flex',
    alignItems: 'center',
    height: '100%', // so cards in row are of same height
  },
  cardContent: {
    display: 'flex',
    flexWrap: 'nowrap',
  },
  iconCol: {
    marginRight: '1rem',
  },
  mainCol: {
    flex: 1,
  },
  icon: {
    fontSize: '4rem',
    color: theme.palette.info.main,
    opacity: '0.8',
  },
  description: {
    fontSize: '1.25rem',
    lineHeight: '1.75rem',
  }
}));


export default useStyles;