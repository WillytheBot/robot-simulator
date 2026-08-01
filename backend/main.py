import asyncio

from fastapi import FastAPI, WebSocket
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

engine = create_engine("sqlite:///robot.db")
Base = declarative_base()
SessionLocal = sessionmaker(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

robot_stato = {
    "name": "UR5e",
    "state": "IDLE",
    "position": {
        "x": 0,
        "y": 0,
        "z": 0
    }
}

active_connections = []

@app.get("/robot/position")
def get_robot_position():
    return robot_stato

class MovimentoRobot(BaseModel):
    asse: str
    distanza: float


@app.post("/robot/move")
async def move_robot(movimento: MovimentoRobot):
    asse = movimento.asse
    distanza = movimento.distanza

    if asse not in robot_stato["position"]:
        return {"error": "Asse non valido"}

    robot_stato["position"][asse] += distanza
    robot_stato["state"] = "MOVING"

    for connection in active_connections:
        await connection.send_json(robot_stato)

    await asyncio.sleep(1.5)  # Simulate movement time

    # Simulate movement completion
    robot_stato["state"] = "IDLE"

    # Save movement history to the database
    db = SessionLocal()
    move_history = MoveHistory(asse=asse, distanza=distanza)
    db.add(move_history)
    db.commit()
    db.close()

    for connection in active_connections:
        await connection.send_json(robot_stato)

    return {"message": f"Robot moved {distanza} units along {asse}", "new_position": robot_stato["position"]}

class MoveHistory(Base):
    __tablename__ = "move_history"
    id = Column(Integer, primary_key=True, index=True)
    asse = Column(String, index=True)
    distanza = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

@app.get("/robot/history")
def get_history():
    db = SessionLocal()
    eventi = db.query(MoveHistory).all()
    db.close()
    return eventi


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        active_connections.remove(websocket)