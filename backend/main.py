from fastapi import FastAPI
from pydantic import BaseModel

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

class MovimentoRobot(BaseModel):
    asse: str
    distanza: float


@app.post("/robot/move")
def move_robot(movimento: MovimentoRobot):
    asse = movimento.asse
    distanza = movimento.distanza

    if asse not in robot_stato["position"]:
        return {"error": "Asse non valido"}

    robot_stato["position"][asse] += distanza
    robot_stato["state"] = "MOVING"

    # Simulate movement completion
    robot_stato["state"] = "IDLE"

    return {"message": f"Robot moved {distanza} units along {asse}", "new_position": robot_stato["position"]}