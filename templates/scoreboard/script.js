const player1Name = document.getElementById("player1-name");
const player1Team = document.getElementById("player1-team");
const player1Score = document.getElementById("player1-score");

const player2Name = document.getElementById("player2-name");
const player2Team = document.getElementById("player2-team");
const player2Score = document.getElementById("player2-score");

const round = document.getElementById("round");

const eventSource = new EventSource("/stream");

eventSource.onopen = () => {
  console.log("SSE connected");
};

eventSource.addEventListener("update", (event) => {
  const data = JSON.parse(event.data);

  const type = data["type"]
  const payload = data["payload"]

  if (type === "scoreboard.update") {
    player1Name.textContent = payload.player1Name;
    player1Team.textContent = payload.player1Team;
    player1Score.textContent = payload.player1Score;

    player2Name.textContent = payload.player2Name;
    player2Team.textContent = payload.player2Team;
    player2Score.textContent = payload.player2Score;

    round.textContent = payload.round;
  }
});

eventSource.onerror = (err) => {
  console.warn("SSE error", err);

  if (eventSource.readyState === EventSource.CONNECTING) {
    console.log("Reconnecting...");
  }
};
