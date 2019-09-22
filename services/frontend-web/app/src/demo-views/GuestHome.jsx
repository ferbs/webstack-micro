import React from 'react';
import { Container, Typography } from '@material-ui/core';
import MinimalLayout from '../layouts/MinimalLayout';
import useStyles from './GuestHome.style';
import {MainNavCardList} from "../components/demo-nav-cards";


export default function GuestHome() {
  const classes = useStyles();

  return <MinimalLayout withSignInOut={true}>
    <div className={classes.hero}>
      <div className={classes.heroContent}>
        <h1 className={classes.heading1 }>webstack-micro</h1>
        <Typography className={classes.subhead} variant={"subtitle2"}>Where more service is better service.</Typography>
      </div>
    </div>
    <Container>
      <MainNavCardList />
    </Container>
  </MinimalLayout>;
}

