import { makeStyles } from '@material-ui/styles';


const useStyles = makeStyles(theme => ({

  editButton: {
    float: 'right',
  },
  deleteButton: {
    float: 'right',
    marginRight: '1rem',
  },
  slideList: {
    paddingBottom: '3rem',
  },
  slideRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    // flexBasis: '60vw',
    // display: 'flex',
    marginTop: '2rem',
    '& .markdown': {
      height: '20vh',
      transform: 'scale(.5)',
      width: '200%', // to offset the .5 scale 
      transformOrigin: 'top left',
      '& h1,h2': {
        paddingTop: 0,
        marginTop: 0,
      }
    },
  },
  slideHolder: {
    cursor: 'pointer',  // todo: when not nowShowing (am not enjoying makeStyles, meh)
  },
  slideNdxBlurb: {
    marginTop: '.5rem',
    textAlign: 'center',
  },
  advanceSlideControl: {
    width: '10vw',
    textAlign: 'center',
    '& button svg': {
      fontSize: '4rem',
    },
  },
  noSlideControl: {
    width: '10vw',
  },
  slideCardThumb: { // passed to Slide's Card component
    width: '50vw',
    padding: '0.5rem',
    '&:hover:not(.now-showing)': {
      boxShadow: `1px 1px 5px 2px ${theme.palette.success.light}`,
    },
  },

  nowShowing: { // passed to Slide's Card component
    boxShadow: `0px 0px 1px 5px ${theme.palette.success.dark}`,
  },

  watchSlidecastArea: {
    padding: '2rem 1rem',
    textAlign: 'center',
    marginTop: '1rem',
    backgroundColor: '#333',
    '& h4': {
      color: theme.palette.info.light,
      margin: 0,
    },
    '& a': {
      color: theme.palette.white,
    }
  },
}));

export default useStyles;
