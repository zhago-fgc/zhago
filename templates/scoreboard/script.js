const eventSource = new EventSource("/stream");

const player1Name = document.getElementById("player1-name");
const player1Team = document.getElementById("player1-team");
const player1Score = document.getElementById("player1-score");

const player2Name = document.getElementById("player2-name");
const player2Team = document.getElementById("player2-team");
const player2Score = document.getElementById("player2-score");

const round = document.getElementById("round");


eventSource.addEventListener("update", (event) => {
  const data = JSON.parse(event.data);

  player1Name.textContent = data.player1Name;
  player1Team.textContent = data.player1Team;
  player1Score.textContent = data.player1Score;

  player2Name.textContent = data.player2Name;
  player2Team.textContent = data.player2Team;
  player2Score.textContent = data.player2Score;

  round.textContent = data.round;
});

eventSource.onerror = (err) => {
  console.log(err)
};
