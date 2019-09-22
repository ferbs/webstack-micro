import React from 'react';
import { Link } from '@reach/router';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
  // root: {
  // },
  navButton: {
    color: theme.palette.primary.contrastText
  },
}));

export default function NavButton({ to, children, ...buttonOpts }) {
  const classes = useStyles();
  return <Link to={ to }>
    <Button className={classes.navButton} { ...buttonOpts }>{children}</Button>
  </Link>
}
