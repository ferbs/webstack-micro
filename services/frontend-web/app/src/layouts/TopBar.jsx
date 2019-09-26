import React from 'react';
import { Link as NavLink } from '@reach/router';
// import Link from '@material-ui/core/Link';
import clsx from 'clsx';
import { AppBar, Button, Toolbar } from '@material-ui/core';
import useAuthContext from "../auth/auth-context";
import useStyles from './TopBar.style';
import SignInOrOutLink from '../auth/SignInOrOut';


export default function TopBar(props) {
  const { className, skipSignInOut, ...rest } = props;
  const classes = useStyles();
  const { isLoggedIn } = useAuthContext();

  return (
    <AppBar
      {...rest}
      className={clsx(classes.root, className)}
      color="primary"
      position="fixed"
    >
      <Toolbar>
        <NavLink to={ isLoggedIn ? '/app/dashboard' : '/app' }>
          <Button className={classes.contrastText}>webstack-micro</Button>
        </NavLink>
        <ul className={classes.navItems}>
          { !skipSignInOut &&
          <li className={classes.navItem}>
            <SignInOrOutLink />
          </li> }
        </ul>
      </Toolbar>
    </AppBar>
  );
};

