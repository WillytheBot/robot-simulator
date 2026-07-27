const stateElement = document.getElementById("robot-state");

const xElement = document.getElementById("robot-x");
const yElement = document.getElementById("robot-y");
const zElement = document.getElementById("robot-z");

const moveXPosButton = document.getElementById("move-x-pos");
const moveYPosButton = document.getElementById("move-y-pos");
const moveZPosButton = document.getElementById("move-z-pos");
const moveXNegButton = document.getElementById("move-x-neg");
const moveYNegButton = document.getElementById("move-y-neg");
const moveZNegButton = document.getElementById("move-z-neg");

const socket = new WebSocket("ws://localhost:8000/ws");

const robot = {
    name: "UR5e",
    state: "IDLE",
    position: { x: 0, y: 0, z: 0 },

    startMovement() {
        this.state = "MOVING";
        updateUI();
    },

    finishMovement() {
        setTimeout(() => {
            this.state = "IDLE";
            updateUI();
        }, 500);
    },

    moveX(distance) {
    if (this.state === "MOVING") {
        return;
    }
    this.startMovement();
    fetch(`http://localhost:8000/robot/move`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            asse: "x",
            distanza: distance
        })
    })
        .then(response => response.json())
        .then(data => {
            this.position = data.new_position;
            this.finishMovement();
        });
    },

    moveY(distance) {
    if (this.state === "MOVING") {
        return;
    }
    this.startMovement();
    fetch(`http://localhost:8000/robot/move`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            asse: "y",
            distanza: distance
        })
    })
        .then(response => response.json())
        .then(data => {
            this.position = data.new_position;
            this.finishMovement();
        });
    },
    
    moveZ(distance) {
    if (this.state === "MOVING") {
        return;
    }
    this.startMovement();
    fetch(`http://localhost:8000/robot/move`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            asse: "z",
            distanza: distance
        })
    })
        .then(response => response.json())
        .then(data => {
            this.position = data.new_position;
            this.finishMovement();
        });
    }
    
}

moveXPosButton.addEventListener("click", () => {
    robot.moveX(1);
});
moveYPosButton.addEventListener("click", () => {
    robot.moveY(1);
});
moveZPosButton.addEventListener("click", () => {
    robot.moveZ(1);
});
moveXNegButton.addEventListener("click", () => {
    robot.moveX(-1);
});
moveYNegButton.addEventListener("click", () => {
    robot.moveY(-1);
});
moveZNegButton.addEventListener("click", () => {
    robot.moveZ(-1);
});

function updateUI() {
    stateElement.textContent = `State: ${robot.state}`;
    xElement.textContent = `X: ${robot.position.x}`;
    yElement.textContent = `Y: ${robot.position.y}`;
    zElement.textContent = `Z: ${robot.position.z}`;
}

updateUI();

socket.onopen = () => {
    console.log("Connessione aperta");
};

socket.onmessage = (event) => {
    const dati = JSON.parse(event.data);
    robot.position = dati.position;
    robot.state = dati.state;
    console.log(dati);
    updateUI();
};

socket.onclose = () => {
    console.log("Connessione chiusa");
};