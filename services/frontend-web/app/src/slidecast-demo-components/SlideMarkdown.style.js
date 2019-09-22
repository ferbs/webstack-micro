import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({

  slideCard: {
    padding: '1rem',
    marginTop: '2rem',

    // mostly from react-markdown demo.css:
    '& pre': {
      border: '1px solid #ccc',
    },
    '& code': {
      fontFamily: 'monospace,monospace',
      fontSize: '1rem',
      display: 'block',
      overflowX: 'auto',
      padding: '0.5rem',
      color: '#333',
      background: '#f8f8f8',
    },
    '& tr': {
      borderTop: '1px solid #c6cbd1',
      background: '#fff',
    },
    '& table tr:nth-child(2n)': {
      background: '#f6f8fa',
    },
    '& th,td': {
      padding: '6px 13px',
      border: '1px solid #dfe2e5',
    },
  },
  
  fullSize: {
    // width: '94vw',
    minHeight: '70vh',
    minWidth: '70vw'
  },
  iconAsSlide: {
    fontSize: '40vh',
    color: '#aaa',
    textAlign: 'center',
    margin: '10vh 0',
    width: '100%',
  }
}));

export default useStyles;
