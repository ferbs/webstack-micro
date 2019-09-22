import React from 'react';
import clsx from 'clsx'
import { Container } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import TopBar from './TopBar';

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 64,
    height: '100%'
  },
  content: {
    height: '100%',
    paddingBottom: '2rem',
  },
  mainBackground: {
    // backgroundColor: theme.palette.background.default,
    background: 'linear-gradient(#fff,#c2c2c2)',
    minHeight: '94vh', // todo: maybe use flex or css grid instead
  },
  noBackground: {
    background: 'unset',
  },
}));


export default function StandardLayout({ children, skipSignInOut, skipBackground, ...props }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <TopBar skipSignInOut={skipSignInOut}/>
      <main className={clsx(classes.content, skipBackground ? classes.noBackground : classes.mainBackground)}>
        <Container>
          {children}
        </Container>
      </main>
    </div>
  );
};
