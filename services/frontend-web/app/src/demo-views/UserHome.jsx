import React from 'react';
import { Typography } from '@material-ui/core';
import StandardLayout from "../layouts/StandardLayout";
import {MainNavCardList} from "../components/demo-nav-cards";
import PersonOutlineIcon from '@material-ui/icons/PersonOutline';
import useAuthContext from "../auth/auth-context";
import useStyles from "./UserHome.style";


export default function Dashboard(props) {
  const classes = useStyles();
  const { user } = useAuthContext();

  return  <StandardLayout>
    { _renderAuthUserInfo(user, classes) }
    <MainNavCardList />
  </StandardLayout>
}



function _renderAuthUserInfo(user, classes) {
  const {displayName, authUserId} = user;
  return <div className={classes.authUserInfo}>
    <Typography variant="h2">Welcome {displayName}</Typography>

    <Typography variant="body1">
      <PersonOutlineIcon className={classes.textIcon} />
      &nbsp;
      Your internal Auth User ID is "{authUserId}"
    </Typography>
  </div>;
}