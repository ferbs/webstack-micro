import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  hero: {
    // backgroundImage: 'linear-gradient(to bottom left, #EB4C0B, #f06d06, #EB4C0B)',
    // heropatterns Architect svg:
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='199' viewBox='0 0 100 199'%3E%3Cg fill='%23cccccc' fill-opacity='0.4'%3E%3Cpath d='M0 199V0h1v1.99L100 199h-1.12L1 4.22V199H0zM100 2h-.12l-1-2H100v2z'%3E%3C/path%3E%3C/g%3E%3C/svg%3E"), 
    linear-gradient(to bottom left, #EB4C0B, #f06d06, #EB4C0B)`,
    height: '44vh',
    position: 'relative',
  },
  heroContent: {
    // todo: flexbox for vertical centering
    width: '100%',
    textAlign: 'center',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  heading1: {
    color: theme.palette.primary.contrastText,
    margin: 0,
  },
  subhead: {
  }
}));


export default useStyles;