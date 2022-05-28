export function setupWebSocket(id: string, cb: (data: any) => void) {
  const ws = new WebSocket(`ws://${location.host}${location.pathname}`);

  ws.onopen = () => {
    console.log(`[WebSocket] Start listening change for collection#${id}`, event);
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

  ws.onclose = () => {
    console.log(`[WebSocket] Stop listening change for collection#${id}`, event);
  };

  return () => {
    ws.close();
  };
}
