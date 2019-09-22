import React from 'react';
import useStyles from './OverviewExplanation.style';


export default function OverviewExplanation() {
  const classes = useStyles();

  return <div className={classes.overviewExplanation}>
    <p>
      Web apps frequently need to perform relatively slow or heavy tasks, such as interacting with a remote API, constructing a PDF, etc.
      You typically want to pass such tasks to a background worker and then display the result to the user after the job finishes.
      We'll refer to this common pattern as background-push.
    </p>
    <p>This page demonstrates a background-push pattern with the following flow:</p>
    <ol>
      <li>
        <b>BackgroundPushDemo.jsx</b> (this <i>frontend-web</i> page) submits an unsorted list as a normal http request.
      </li>
      <li>
        <b>ai_sort_controller.rb</b> in <i>backend-api</i> receives the request. It does a bit of validation then adds a task to the "ai-sort" queue of our <i>rabbitmq-broker</i>
        before responding to the client.
      </li>
      <li>
        <b>ai_sort_worker.rb</b> watches the "ai-sort" queue and begins the task once a <i>background-worker</i> is available.
        <ul>
          <li>When finished, the worker saves its result before passing it to our <i>websocket-push</i> servers for delivery to the browser.</li>
          <li>Note: in this example, <i>background-worker</i> and the <i>backend-api</i> share the same code base. They run as different
            services, one started as an http server, the other as a worker watching for jobs in its queue.</li>
          <li>
            Note: we communicate between services this time using Redis pub-sub. RabbitMQ is TOO reliable, we don't want to deal with
            long-lived dead-letter failures or with the more complicated Rabbit settings (eg topic fan-outs.)
          </li>
        </ul>
      </li>
      <li>
        <i>websocket-push</i>, seeing that the worker set a "pushToUser" destination, relays the message on all WebSocket connections
        for that user. (See services/websocket-push/README.md re message destinations.)
      </li>
      <li>
        <b>BackgroundPushDemo.jsx</b> receives the WebSocket message.
        <ul>
          <li>
            The payload was formatted by the worker as a front-end reducer action, one that is dispatched to the reducer defined
            at the top of BackgroundPushDemo.jsx. This updates the React state/context and displays the result on this page.
          </li>
          <li>
            Should the client lose its WebSocket connection, it shows a status message. The state is refreshed from the server
            each time the connection is re-established. 
          </li>
        </ul>
      </li>
    </ol>
  </div>;
}

