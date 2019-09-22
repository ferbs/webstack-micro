import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import SignInOrOutLink from "../auth/SignInOrOut";

const useStyles = makeStyles(() => ({
  outer: {
    height: '100%'
  },
  content: {
    height: '100%'
  },
  signInOut: {
    position: 'absolute',
    right: '.5rem',
    top: '.5rem',
    zIndex: 900,
  },
}));

export default function MinimalLayout({ children, withSignInOut, ...props }) {
  const classes = useStyles();

  return (
    <div className={clsx('sign-in-out', classes.outer)}>
      { withSignInOut &&
      <div className={classes.signInOut}>
        <SignInOrOutLink />
      </div>
      }
      <main className={classes.content}>
        {children}
      </main>
    </div>
  );
};
