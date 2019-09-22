import React from 'react';
import { CircularProgress } from '@material-ui/core';
import PowerIcon from '@material-ui/icons/Power';
import PowerOffIcon from '@material-ui/icons/PowerOff';
import useStyles from "./ConnectionStatus.style";


export default function ConnectionStatus({ hasWebSocketConnection, isAttemptingWebSocketConnection }) {
  const classes = useStyles();
  const renderStatus = (Icon, msg, iconProps={}) => <span
    className={classes.statusMessage}>
    <Icon {...iconProps } />
    <p>{ msg }</p>
  </span>;

  let res;
  if (isAttemptingWebSocketConnection) {  // todo: only display check webSocket connection state
    res = renderStatus(CircularProgress, 'Connecting...', { size: 12 });
  } else if (hasWebSocketConnection) {
    res = renderStatus(PowerIcon, 'WebSocket connected.');
  } else {
    res = renderStatus(PowerOffIcon, 'Disconnected from server.');
  }
  return res;
}
