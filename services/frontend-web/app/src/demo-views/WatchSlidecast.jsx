import React from 'react';
import FullScreenSlide from '../slidecast-demo-components/FullScreenSlide';
import StandardLayout from '../layouts/StandardLayout';
import {registerReducers} from "../realtime/internal/server-message-reducer";
import useServerDispatch, {clientCommands} from "../realtime/server-dispatch-hook";
import {fetchCurrentSlide} from "../demo-apis/slidecast-api";
import useWebSocketSubscription from "../realtime/subscription-hook";


registerReducers('slidecast', { // action data and broadcast done in backend-api/app/lib/workers/ai_sort_worker.rb
  [ clientCommands.Slidecast.ShowSlide ]: (prevState, action) => {
    const { type, ...props } = action; // looks like { markdown, title }
    return {
      error: null,
      ...prevState,
      ...props,
    };
  },
  [ clientCommands.Slidecast.End ]: (prevState, action) => {
    return {
      ...prevState,
      markdown: null,
    };
  },
  [ clientCommands.Slidecast.ShowError ]: (prevState, action) => {
    let { errorCode, message } = action;
    return { ...prevState, error: { errorCode, message } }
  }
});


export default function WatchSlidecast({ slidecastId }) {
  const room = `slidecast:${slidecastId}`;
  const { slidecast, webSocketConnection } = useServerDispatch({
    fetchState: () => fetchCurrentSlide(slidecastId)
  });
  useWebSocketSubscription(room);
  const { hasWebSocketConnection, isAttemptingWebSocketConnection } = webSocketConnection;
  const currentSlideProps = {
    ...(slidecast || {}), // context data from useServerDispatch "slidecast" field: markdown, title, error
    isAttemptingWebSocketConnection, hasWebSocketConnection,
    slidecastId,
  };
  return <StandardLayout>
    <FullScreenSlide
      { ...currentSlideProps }
    />
  </StandardLayout>
}
