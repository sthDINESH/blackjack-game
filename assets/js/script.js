// Constants to represent a deck of cards
const suits = ["Heart", "Spade", "Diamond", "Club"];
// const suits = ["Heart"];
const cardNumbers = [
  "Ace",
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  "Jack",
  "Queen",
  "King",
];
const cardValues = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
const cards = [];

/**
 * Function to initialize global cards[] with the cards available in the game
 *  */
function initializeCards() {
  for (let suit of suits) {
    for (let index = 0; index < cardValues.length; index++) {
      cards.push({
        suit: suit,
        number: cardNumbers[index],
        value: cardValues[index],
      });
    }
  }
}

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

  //   Initialize available cards
  initializeCards();
  //   console.log(cards)
};
