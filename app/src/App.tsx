import { useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    console.log('Attempting to establish WebSocket connection...');

    socketRef.current = new WebSocket('ws://localhost:6969');

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established!');
    };

    socketRef.current.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
    };

    // Handle incoming video frames
    socketRef.current.onmessage = (event) => {
      console.log(
        'Received video frame:',
        event.data.slice(0, 100),
        '...'
      );

      const img = imageRef.current;

      if (img) {
        img.src = event.data;
      }
    };

    // Handle closing of the WebSocket connection before page unload
    window.addEventListener('beforeunload', () => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.close();
      }
    });

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <div>
      <img ref={imageRef}/>
    </div>
  );
};

export default App;
