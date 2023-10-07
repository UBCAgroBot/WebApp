const server = Bun.serve({
  port: 6969,
  fetch(req) {
    const url = new URL(req.url);
    switch (url.pathname) {
      case "/":
        return new Response("Hello World!");
      case "/video":
        // upgrade the request to a WebSocket
        if (server.upgrade(req)) {
          return; // do not return a Response
        }
        return new Response("Upgrade failed :(", { status: 500 });
      default:
        return new Response("404!");
    }
  },
  websocket: {
    async open(ws) {
      // Start streaming the video "./test.mp4" in a loop
      while (true) {
        // Read a chunk of the video file and send it to the client
        const file = Bun.file("./test.mp4");
        const stream = file.stream();

        for await (const chunk of stream) {
          // Send the chunk to the client
          ws.send(chunk);
        }
      }
    },
    message(ws, message) {
      console.log(`Received ${message}`);
      // handle the message
    },
    close(ws, code, reason) {
      console.log(`WebSocket closed with ${code}: ${reason}`);
      // handle the close event
      ws.close();
    },
    drain(ws) {
      console.log('WebSocket drain event triggered');
      // Ready to receive more data
    }
  },
});

console.log(`Listening on http://${server.hostname}:${server.port}`);
