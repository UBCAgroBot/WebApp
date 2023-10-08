import './App.css'
import { useEffect, useRef } from "react";

const App = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    console.log('Attempting to establish WebSocket connection...');

    socketRef.current = new WebSocket("ws://localhost:6969");

    socketRef.current.onopen = () => {
      console.log('WebSocket connection established!');
    };

    socketRef.current.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
    };

    // Handle incoming video frames
    socketRef.current.onmessage = (event) => {
      if (event.data instanceof Blob) {
        const blob = event.data;
        console.log('Received video frame:', blob.size, 'bytes')

        // Decode and display the received frame
        const imageUrl = URL.createObjectURL(blob);

        const video = videoRef.current;

        if (video) {
          video.src = imageUrl;
        }
      } else {
        console.error('Invalid data received:', event.data);
      }
    };

    // Handle closing of the WebSocket connection before page unload
    window.addEventListener('beforeunload', () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    });

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} controls></video>
    </div>
  );
}

export default App
