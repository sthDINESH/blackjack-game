const btnsGame = document.querySelector("#btns-game");
const btnPlay = document.querySelector("#btn-play");
const btnHit = document.querySelector("#btn-hit");
const btnStand = document.querySelector("#btn-stand");

// Remove Hit and Stand Buttons before the game starts
btnsGame.removeChild(btnHit);
btnsGame.removeChild(btnStand);

const playGame = () => {
  btnsGame.appendChild(btnHit);
  btnsGame.appendChild(btnStand);
  btnsGame.removeChild(btnPlay);
};
