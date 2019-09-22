import React from 'react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';
import { Card } from '@material-ui/core';
import ScheduleIcon from '@material-ui/icons/Schedule';
import PowerOffIcon from '@material-ui/icons/PowerOff';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import useStyles from "./SlideMarkdown.style";


export const IconType = {
  Disconnected: 'Disconnected',
  Error: 'Error',
  NoContent: 'NoContent',
};

const IconByType = {
  [IconType.Disconnected]: PowerOffIcon,
  [IconType.Error]: ErrorOutlineIcon,
  [IconType.NoContent]: ScheduleIcon,
};


export default function Slide({ markdown, iconType, iconProps, errorMessage, className, fullSize }) {
  const classes = useStyles();
  if (!iconType && (typeof markdown !== 'string' || !markdown.length)) {
    iconType = IconByType.Error;
  }
  if (errorMessage) {
    console.log('todo: show errorMessage under icon', errorMessage); // todo
  }

  let content;
  if (iconType) {
    const Icon = IconByType[iconType] || IconByType.Error;
    iconProps = iconProps || {};
    content = <Icon
      className={ classes.iconAsSlide }
      { ...iconProps }
    />
  } else {
    // see https://github.com/rexxars/react-markdown
    content = <div className="markdown"><ReactMarkdown source={markdown} /></div>;
  }
  return <Card className={clsx(className, classes.slideCard, fullSize && classes.fullSize, "slide-card")} raised={true}>
    { content }
  </Card>;
}

