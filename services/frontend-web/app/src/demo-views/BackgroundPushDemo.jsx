import React from 'react';
import { Card, CardContent } from '@material-ui/core';
import StandardLayout from "../layouts/StandardLayout";
import { postAiSortJob, fetchRecentResult } from '../demo-apis/background-push-api';
import useServerDispatch, {registerReducers} from "../realtime/server-dispatch-hook";
import clientCommands from '../shared-constants.generated/client-commands.json';
import OverviewExplanation from "../background-push-demo-components/OverviewExplanation";
import ElementsForm from "../background-push-demo-components/ElementsForm";
import useStyles from './BackgroundPushDemo.style';
import LatestResult from "../background-push-demo-components/LatestResult";
import ConnectionStatus from "../background-push-demo-components/ConnectionStatus";


// code that sets the action's data (and sends it over WebSockets) at: backend-api/app/lib/workers/ai_sort_worker.rb
registerReducers('aiSort', {
  [ clientCommands.AiSort.UpdateList ]: (prevState, action) => {
    return { ...prevState,
      sortedList: action.sortedList,
      error: null,
    };
  },
  [ clientCommands.AiSort.ShowError ]: (prevState, action) => {
    const { errorCode, message } = action;
    return { ...prevState,
      sortedList: null,
      error: { errorCode, message }
    };
  }
});


export default function BackgroundPushDemo() {
  const { aiSort, webSocketConnection } = useServerDispatch({
    fetchState: fetchRecentResult,
  });
  const { hasWebSocketConnection, isAttemptingWebSocketConnection } = webSocketConnection;
  const { sortedList, error } = aiSort || {};

  const postToWorker = elements => postAiSortJob(elements)
    .then(data => {
      const { jobId } = data;
      console.log(`Success posting list items for ai sort, jobId "${jobId}". We might use jobId to better track working indicators/spinners`);
    })
    .catch(err => {
      console.warn('Error posting to AiSort', err);
    });


  const classes = useStyles();

  return <StandardLayout>
    <div className={classes.backgroundPushDemo}>
      <h1>Background-Push Demo</h1>
      <OverviewExplanation />

      <Card className={classes.tryItArea}>
        <ConnectionStatus
          hasWebSocketConnection={hasWebSocketConnection}
          isAttemptingWebSocketConnection={isAttemptingWebSocketConnection}
        />

        <CardContent>
          <h2>Try It</h2>

          { hasWebSocketConnection &&
          <LatestResult
            sortedList={sortedList}
            hasWebSocketConnection={hasWebSocketConnection}
          />
          }

          <ElementsForm
            postToWorker={postToWorker}
            error={error}
            initialElements={ sortedList }
          />
        </CardContent>
      </Card>
    </div>
  </StandardLayout>;
}

