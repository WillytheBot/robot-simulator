# Robot Monitor & Control Simulator
 
A web-based monitoring and control simulator for an industrial robot (inspired by the Universal Robots UR5e), featuring a Python backend, real-time updates over WebSocket, and persistent movement history.
 
## Context
 
This project was built to combine hands-on experience in industrial robotics support (Universal Robots collaborative robots) with full-stack software development: a system that simulates monitoring and controlling a robot, with an architecture close to a real industrial supervision system (SCADA-like).
 
## Features
 
- Real-time display of robot state (IDLE/MOVING) and position (X, Y, Z)
- Rotation control (RX, RY, RZ), following the same pattern as position
- Movement control on each axis, both **relative** (incremental +/- steps) and **absolute** (direct target value input)
- Visual state indicator (color) and movement progress bar, synchronized with the backend
- Movement history persisted to a database, updated automatically in real time for all connected clients
- WebSocket connection status indicator
- Real-time bidirectional communication via WebSocket, alongside a standard REST API
- Dark-themed, card-based dashboard UI
## Tech stack
 
**Backend**
- Python 3, FastAPI, Uvicorn
- SQLAlchemy + SQLite for movement history persistence
- FastAPI's native WebSocket support for real-time updates
- Docker for containerization
**Frontend**
- HTML, CSS, JavaScript (vanilla, no framework)
- Fetch API for REST calls, native WebSocket API for real-time updates
## Architecture
 
```
Frontend (browser)  <--- REST (fetch) --->  Backend (FastAPI)
Frontend (browser)  <--- WebSocket    --->  Backend (FastAPI)
                                              |
                                              v
                                        SQLite (movement history)
```
 
Every movement requested from the frontend is sent to the backend via REST; the backend updates the state, simulates a realistic movement duration, saves the event to the database, and notifies all connected clients in real time over WebSocket.
 
## Getting started (local development)
 
Backend:
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```
 
Frontend: just open `index.html` in your browser (or use an extension like Live Server).
 
With Docker:
```bash
cd backend
docker build -t robot-simulator-backend .
docker run -p 8000:8000 robot-simulator-backend
```
 
## Project status
 
Actively in development. Roadmap:
- [x] REST backend (read state, send movement commands)
- [x] Movement history persistence (SQLite + SQLAlchemy)
- [x] Real-time updates via WebSocket
- [x] Dockerized backend
- [x] Polished, dark-themed UI (card-based dashboard, status indicators, real-time history)
- [x] Direct target value input for movement (in addition to incremental controls)
- [x] Rotation support (RX, RY, RZ), in addition to linear X/Y/Z movement
- [ ] Additional robot states (ERROR/OFFLINE) with simulated events
- [ ] Online deployment (publicly reachable backend + frontend)
## Notes
 
This is a personal portfolio project, built as part of a career transition from industrial robotics technician to software developer.