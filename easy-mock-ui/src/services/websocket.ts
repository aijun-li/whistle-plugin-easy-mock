export function setupWebSocket(id: string, cb: (data: any) => void) {
  let ws: WebSocket;

  function _setup() {
    ws = new WebSocket(`ws://${location.host}${location.pathname}`);

    ws.onopen = () => {
      console.log(`[WebSocket] Start listening change for collection#${id}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id === id) {
          console.log(`[WebSocket] Received message: ${event.data}`);
          cb(data);
        }
      } catch {}
    };

    ws.onclose = (event) => {
      console.log(`[WebSocket] Stop listening change for collection#${id}`, event);
      if (event.code !== 3333) {
        console.log(`[WebSocket] Closed accidentally! Restarting...`);
        _setup();
      }
    };
  }

  _setup();

  return () => {
    ws.close(3333, 'closed manually');
  };
}
