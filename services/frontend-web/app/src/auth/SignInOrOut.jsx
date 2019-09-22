import React from 'react';
import NavButton from "../components/NavButton";
import useAuthContext from "./auth-context";
import { Button } from '@material-ui/core';
import useStyles from './SignInOrOut.style';


export default function SignInOrOutLink() {
  const { isLoggedIn, submitSignOut } = useAuthContext();
  const classes = useStyles();

  const handleSignout = (evt) => {
    submitSignOut('/');
  };
  if (isLoggedIn) {
    return <Button
      onClick={handleSignout}
      className={ classes.contrastText }
    >
      Sign out
    </Button>
  } else {
    return <NavButton to="/app/sign_in">Sign in</NavButton>;
  }
}
