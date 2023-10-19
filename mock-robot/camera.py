import asyncio
import base64
import json

import cv2 as cv
import websockets

SHOW_IMAGE = False
PORT = 6969
BLACK_AND_WHITE = False


async def send_camera_feed(websocket, path):
    global BLACK_AND_WHITE
    cap = cv.VideoCapture(0)

    try:
        while cap.isOpened():
            ret, frame = cap.read()

            if BLACK_AND_WHITE:
                frame = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)

            if SHOW_IMAGE:
                # Show the image using OpenCV
                cv.imshow('Camera Feed', frame)
                cv.waitKey(1)  # Wait for a short duration to refresh the OpenCV window

            # Encode frame to base64
            _, buffer = cv.imencode('.jpg', frame)
            frame_base64 = base64.b64encode(buffer)

            # Send frame to WebSocket server
            await websocket.send(f'data:image/jpeg;base64,{frame_base64.decode("utf-8")}')

            # get response from client with configuration
            message = await websocket.recv()
            message_data = json.loads(message)

            # update configuration
            BLACK_AND_WHITE = message_data.get('blackAndWhite', False)
    except Exception as e:
        print(f'Error: {e}')
    finally:
        cap.release()
        cv.destroyAllWindows()
        await websocket.close()


start_server = websockets.serve(send_camera_feed, 'localhost', PORT)
print(f'Websocket server is listening on port {PORT}')

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
