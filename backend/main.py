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
    },
    "rotation": {
        "rx": 0,
        "ry": 0,
        "rz": 0
    }
}

active_connections = []

@app.get("/robot/position")
def get_robot_position():
    return robot_stato

class MovimentoRobot(BaseModel):
    asse: str
    valore: float
    tipo: str


@app.post("/robot/move")
async def move_robot(movimento: MovimentoRobot):
    asse = movimento.asse
    valore = movimento.valore

    if asse in robot_stato["position"]:
        gruppo = robot_stato["position"]
    elif asse in robot_stato["rotation"]:
        gruppo = robot_stato["rotation"]
    else:
        return {"error": "Asse non valido"}

    if movimento.tipo == "assoluto":
        gruppo[asse] = valore
    else:
        gruppo[asse] += valore
        
    robot_stato["state"] = "MOVING"
    
    for connection in active_connections:
        await connection.send_json(robot_stato)

    await asyncio.sleep(1.5)  # Simulate movement time

    # Simulate movement completion
    robot_stato["state"] = "IDLE"

    # Save movement history to the database
    db = SessionLocal()
    move_history = MoveHistory(asse=asse, distanza=valore)
    db.add(move_history)
    db.commit()
    db.close()

    messaggio = {**robot_stato, "asse": asse, "distanza": valore}

    for connection in active_connections:
        await connection.send_json(messaggio)

    return {"message": f"Robot moved {valore} units along {asse}", "new_position": robot_stato["position"], "new_rotation": robot_stato["rotation"]}

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