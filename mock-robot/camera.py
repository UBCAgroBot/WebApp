import asyncio
import base64

import cv2 as cv
import websockets

show_image = False


async def send_camera_feed(websocket, path):
    cap = cv.VideoCapture(0)

    try:
        while cap.isOpened():
            ret, frame = cap.read()

            if show_image:
                # Show the image using OpenCV
                cv.imshow('Camera Feed', frame)
                cv.waitKey(1)  # Wait for a short duration to refresh the OpenCV window

            # Encode frame to base64
            _, buffer = cv.imencode('.jpg', frame)
            frame_base64 = base64.b64encode(buffer)

            # Send frame to WebSocket server
            await websocket.send(f"data:image/jpeg;base64,{frame_base64.decode('utf-8')}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        cap.release()
        cv.destroyAllWindows()
        await websocket.close()


start_server = websockets.serve(send_camera_feed, "localhost", 6969)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()