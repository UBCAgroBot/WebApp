import { useEffect, useRef, useState } from 'react';
import { Button } from "@/components/ui/button.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";

const App = () => {
  const [initialConnection, setInitialConnection] = useState(false);
  const [output, setOutput] = useState([
    'Waiting for WebSocket connection...',
  ]);
  const [isBlackAndWhite, setIsBlackAndWhite] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const codeContainerRef = useRef<HTMLImageElement | null>(null);
  const [tailOutput, setTailOutput] = useState(true);

  // Scroll to bottom whenever output changes
  useEffect(() => {
    if (codeContainerRef.current && tailOutput) {
      codeContainerRef.current.scrollTop = codeContainerRef.current.scrollHeight;
    }
  }, [output, tailOutput]);

  const addOutput = (line: string) => {
    setOutput((prev) =>  [...prev, line]);
  }

  useEffect(() => {
    socketRef.current = new WebSocket('ws://localhost:6969');

    socketRef.current.onopen = () => {
      addOutput('WebSocket connection established!')
      setInitialConnection(true);
    };

    socketRef.current.onclose = () => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.CLOSED &&
        initialConnection
      ) {
        socketRef.current.close();
        setInitialConnection(false)
        addOutput('WebSocket connection closed')
      }
    };

    // Handle incoming video frames
    socketRef.current.onmessage = (event) => {
      const img = imageRef.current;

      if (img) {
        img.src = event.data;
        addOutput('Video frame updated')
      }

      socketRef.current?.send(JSON.stringify({ blackAndWhite: isBlackAndWhite }));
    };

    // Handle closing of the WebSocket connection before page unload
    window.addEventListener('beforeunload', () => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.close();
        addOutput('WebSocket connection closed')
      }
    });

    // Clean up the WebSocket connection when the component unmounts
    return () => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN
      ) {
        socketRef.current.close();
        addOutput('WebSocket connection closed')
      }
    };
  }, [initialConnection, isBlackAndWhite]);

  return (
    <div className="grid lg:h-screen w-full p-4 gap-4 lg:grid-cols-[3fr,2fr]">
      <div className="flex flex-col gap-4">
        <div className="relative aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow">
          <img
            alt="Video feed"
            className="object-cover cursor-pointer transform transition-transform duration-200 hover:scale-105"
            height="500"
            src="/placeholder.svg"
            style={{
              aspectRatio: "900/500",
              objectFit: "cover",
            }}
            width="900"
            ref={imageRef}
          />
        </div>
        <div className="flex flex-col gap-2 border p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Control Panel</h2>
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={()=> {
              // close connection
              socketRef.current?.close();
            }}>Start</Button>
            <Button variant="destructive">Stop</Button>
            <Button>Auto</Button>
            <Button>Manual</Button>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => {
            setIsBlackAndWhite(!isBlackAndWhite)
          }}>{isBlackAndWhite ? 'Color' : 'Black & White'}</Button>
          <Button variant="outline" disabled>Mask</Button>
        </div>
      </div>
      <div className="flex flex-col gap-4 h-screen lg:h-full overflow-auto">
        <div className="flex flex-col gap-2 border p-4 rounded-lg shadow h-full">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Terminal Output</h2>
            <div className="flex items-center">
              <Checkbox id="tail-output" defaultChecked={tailOutput} onClick={() => {
                setTailOutput(!tailOutput)
              }} />
              <label className="ml-2 text-gray-700" htmlFor="tail-output">
                Tail Output
              </label>
            </div>
          </div>
          <div className="bg-black rounded-lg p-4 text-green-400 dark:text-green-500 h-full overflow-auto" ref={codeContainerRef}>
              {output.map((line, index) => (
                <div key={index}><code>&gt; {line}</code></div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
