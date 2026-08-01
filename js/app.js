const stateElement = document.getElementById("robot-state-text");
const stateIndicator = document.getElementById("state-indicator");

const xElement = document.getElementById("robot-x");
const yElement = document.getElementById("robot-y");
const zElement = document.getElementById("robot-z");

const moveXPosButton = document.getElementById("move-x-pos");
const moveYPosButton = document.getElementById("move-y-pos");
const moveZPosButton = document.getElementById("move-z-pos");
const moveXNegButton = document.getElementById("move-x-neg");
const moveYNegButton = document.getElementById("move-y-neg");
const moveZNegButton = document.getElementById("move-z-neg");
const inputX = document.getElementById("input-x");
const gotoXButton = document.getElementById("goto-x");
const inputY = document.getElementById("input-y");
const gotoYButton = document.getElementById("goto-y");
const inputZ = document.getElementById("input-z");
const gotoZButton = document.getElementById("goto-z");

const progressBar = document.getElementById("progress-bar");

const historyList = document.getElementById("history-list");

const socket = new WebSocket("ws://localhost:8000/ws");
const connectionStatus = document.getElementById("connection-status");

const robot = {
    name: "UR5e",
    state: "IDLE",
    position: { x: 0, y: 0, z: 0 },

    startMovement() {
        this.state = "MOVING";
        progressBar.style.width = "100%";
        updateUI();
    },

    finishMovement() {
        updateUI();
    },


    goToX(valore) {
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
            valore: valore,
            tipo: "assoluto"
        })
    })
        .then(response => response.json())
        .then(data => {
            this.position = data.new_position;
            this.finishMovement();
        });
    },

    goToY(valore) {
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
            valore: valore,
            tipo: "assoluto"
        })
    })
        .then(response => response.json())
        .then(data => {
            this.position = data.new_position;
            this.finishMovement();
        });
    },

    goToZ(valore) {
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
            valore: valore,
            tipo: "assoluto"
        })
    })
        .then(response => response.json())
        .then(data => {
            this.position = data.new_position;
            this.finishMovement();
        });
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
            valore: distance,
            tipo: "relativo"
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
            valore: distance,
            tipo: "relativo"
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
            valore: distance,
            tipo: "relativo"
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

gotoXButton.addEventListener("click", () => {
    const valore = parseFloat(inputX.value);
    robot.goToX(valore);
});
gotoYButton.addEventListener("click", () => {
    const valore = parseFloat(inputY.value);
    robot.goToY(valore);
});
gotoZButton.addEventListener("click", () => {
    const valore = parseFloat(inputZ.value);
    robot.goToZ(valore);
});

function updateUI() {
    stateElement.textContent = `State: ${robot.state}`;
    xElement.textContent = `X: ${robot.position.x}`;
    yElement.textContent = `Y: ${robot.position.y}`;
    zElement.textContent = `Z: ${robot.position.z}`;
    if (robot.state === "IDLE") {
    stateIndicator.style.backgroundColor = "green";
    } else if (robot.state === "MOVING") {
    stateIndicator.style.backgroundColor = "orange";
    }
}

updateUI();

socket.onopen = () => {
    connectionStatus.textContent = "● Connesso";
    connectionStatus.style.color = "green";
    console.log("Connessione aperta");
};

socket.onmessage = (event) => {
    const dati = JSON.parse(event.data);
    robot.position = dati.position;
    robot.state = dati.state;
    if (dati.state === "IDLE") {
        progressBar.classList.add("no-transition");
        progressBar.style.width = "0%";
        progressBar.offsetHeight; // Trigger reflow
        progressBar.classList.remove("no-transition");

        aggiungiEventoStorico({
        asse: dati.asse,
        distanza: dati.distanza,
        timestamp: new Date().toISOString()
        });
    }
    updateUI();
};

socket.onclose = () => {
    connectionStatus.textContent = "● Disconnesso";
    connectionStatus.style.color = "red";
    console.log("Connessione chiusa");
};

async function caricaStorico() {
    const risposta = await fetch("http://localhost:8000/robot/history");
    const dati = await risposta.json();
    dati.forEach(evento => aggiungiEventoStorico(evento));
}

function aggiungiEventoStorico(evento) {
    const nuovoElemento = document.createElement("li");
    const orario = new Date(evento.timestamp).toLocaleString();
    nuovoElemento.textContent = `[${orario}] ${evento.asse.toUpperCase()} moved by ${evento.distanza}`;
    historyList.appendChild(nuovoElemento);
}

caricaStorico();
