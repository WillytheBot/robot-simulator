from fastapi import FastAPI

app = FastAPI()

robot_stato = {
    "name": "UR5e",
    "state": "IDLE",
    "position": {
        "x": 0,
        "y": 0,
        "z": 0
    }
}

@app.get("/robot/position")
def get_robot_position():
    return robot_stato