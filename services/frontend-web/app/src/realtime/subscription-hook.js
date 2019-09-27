import React from "react"
import {useRealtimeContext} from "./internal/realtime-context";


export default function useWebSocketSubscription(room) {
  const { sendWhenConnected } = useRealtimeContext();
  React.useEffect(() => {
    if (room) {
      sendWhenConnected({ joinRoom: room }, { expires: false }); // by not expiring it might send repeated join/leave messages. Prob harmless but would need improvements if not
    }
    return () => {
      if (room) {
        sendWhenConnected({ leaveRoom: room }, { expires: false });
      }
    }
  }, [ sendWhenConnected, room ]);

}