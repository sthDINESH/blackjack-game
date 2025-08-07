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

// Global object to store the cards available in the game
const deck = [];

// Global objects to store player and dealer details
const dealer = {};
const player = {};

/**
 * Function to initialize global deck[] with the deck available in the game
 *  */
function initializeDeck() {
  for (let suit of suits) {
    for (let index = 0; index < cardValues.length; index++) {
      deck.push({
        suit: suit,
        number: cardNumbers[index],
        value: cardValues[index],
      });
    }
  }
}
/**
 * Draw deck from the deck and add it to user's hand
 * @param {*} user: global object to add the drawn deck to
 * @param {*} numCardsToDraw : number of deck to draw from the deck
 */
function drawCard(user, numCardsToDraw = 1) {
  //   Create an empty array to store the hand if the key is not present
  if (user["hand"] === undefined) {
    user["hand"] = [];
  }

  for (let count = 0; count < numCardsToDraw; count++) {
    // Pick a card at random index from the deck
    let index = Math.floor(Math.random() * deck.length);
    // Add the card to the user's hand
    user["hand"].push(deck[index]);
    // Remove the card from the deck
    deck.splice(index, 1);
  }
//   user["sum"] = calculateSum(user["hand"]);
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

  // Initialize available deck
  initializeDeck();
  console.log(deck);

  // Initialize the dealer and player hand with 2 cards
  drawCard(dealer,2);
  drawCard(player,2);
  console.log(dealer);
  console.log(player);
};
