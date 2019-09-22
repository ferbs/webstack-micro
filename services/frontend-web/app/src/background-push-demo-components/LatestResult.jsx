import React from 'react';
import useStyles from "./LatestResult.style";


export default function LatestResult({ sortedList, hasWebSocketConnection }) {
  const classes = useStyles();
  if (!hasWebSocketConnection) {
    return <p>Disconnected from server &mdash; hiding possibly old/stale results</p>;;
  }

  const content = Array.isArray(sortedList) && sortedList.length ?
    <pre>{ sortedList.join('\n') }</pre> :
    <h4 className={classes.noResultsYet}>Items have not yet been sorted.</h4>;

  return <div className={classes.resultsArea}>
    <h4>Shared Results</h4>
    <p>
      One sorted list is saved per authenticated user, and this page will display the same values in each window tab for that person. It
      is fetched on page load and refreshed by WebSocket message and on each server reconnect.
    </p>

    { content }
  </div>
}
