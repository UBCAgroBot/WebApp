import { useEffect, useRef, useState } from 'react';
import './App.css';

const App = () => {
  const [isBlackAndWhite, setIsBlackAndWhite] = useState(false);
  const [src, setSrc] = useState('');
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
      const blob = new Blob([event.data], { type: 'src/jpeg' });
      const url = URL.createObjectURL(blob);

      // Revoke the previous object URL to avoid memory leaks
      if (src) {
        URL.revokeObjectURL(src);
      }

      setSrc(url);

      // socketRef.current?.send(JSON.stringify({ blackAndWhite: isBlackAndWhite }));
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
  }, [isBlackAndWhite]);

  return (
    <div>
      <img src={src} width='75%' alt='Video feed' />
      <br />
      <button
        onClick={() => {
          setIsBlackAndWhite(!isBlackAndWhite)
        }}
        disabled>
        {isBlackAndWhite ? 'Show Color' : 'Show Black & White'}
      </button>
    </div>
  );
};

export default App;
