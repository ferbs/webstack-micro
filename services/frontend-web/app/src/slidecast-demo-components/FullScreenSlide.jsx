import React from 'react';
import clsx from 'clsx';
import { CircularProgress } from '@material-ui/core';
import SlideMarkdown, {IconType} from './SlideMarkdown';
import useStyles from './FullScreenSlide.style';




export default function FullScreenSlide({ isAttemptingWebSocketConnection, hasWebSocketConnection, markdown, title, error, className }) {
  let iconType;
  if (!hasWebSocketConnection) {
    iconType = IconType.Disconnected;
  } else if (error) {
    iconType = IconType.Error;
  }
  if (error) {
    console.warn('todo: show error', error);
  }
  const classes = useStyles();
  const content = isAttemptingWebSocketConnection ?
    <div className={classes.loadingSpinnerHolder}><CircularProgress /></div>:
    <SlideMarkdown markdown={markdown} className={classes.fullViewSlideCard } iconType={iconType} fullSize={true}/>;
  
  return <div className={clsx(className, classes.fullScreenSlideContainer)}>
    { _bestTitle({ title, isAttemptingWebSocketConnection, hasWebSocketConnection, classes })}
    <div>
      { content }
    </div>
  </div>
}

function _bestTitle({ title, isAttemptingWebSocketConnection, hasWebSocketConnection, hasEnded, classes }) {
  let content;
  if (isAttemptingWebSocketConnection) {
    content = 'Loading...';
  } else if (!hasWebSocketConnection) {
    content = 'Disconnected from server...';
  } else if (hasEnded) {
    content = 'This SlideCast has ended.';
  } else if (title) {
    content = <>Watching SlideCast: <i>{ title }</i></>;
  } else {
    content = 'SlideCast not in progress';
  }
  return <h1 className={classes.slideCastTitle}>{ content }</h1>;
}