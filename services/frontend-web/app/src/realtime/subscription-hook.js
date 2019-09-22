import React from "react"
import {useRealtimeContext} from "./internal/realtime-context";


export default function useWebSocketSubscription(room) {
  const { sendWhenConnected } = useRealtimeContext();
  React.useEffect(() => {
    sendWhenConnected({ joinRoom: room }, { expires: false }); // by not expiring it might send repeated join/leave messages. Prob harmless but would need improvements if not
    return () => {
      sendWhenConnected({ leaveRoom: room }, { expires: false });
    }
  }, [ sendWhenConnected, room ]);

}