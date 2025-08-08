const playerCardsContainerID = "#player-cards";
const playerSumContainerID = "#player-sum";
const dealerCardsContainerID = "#dealer-cards";
const dealerSumContainerID = "#dealer-sum";

const btnsGame = document.querySelector("#btns-game");
const btnPlay = document.querySelector("#btn-play");
const btnHit = document.querySelector("#btn-hit");
const btnStand = document.querySelector("#btn-stand");

// Remove Hit and Stand Buttons before the game starts
btnsGame.removeChild(btnHit);
btnsGame.removeChild(btnStand);


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

dealer["cardsContainerId"] = dealerCardsContainerID;
dealer["sumContainerId"] = dealerSumContainerID;

player["cardsContainerId"] = playerCardsContainerID;
player["sumContainerId"] = playerSumContainerID;

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
 * Check if the current hand includes Ace cards marked with value of 11; helper to calculate sum
 * @param {} hand: array of cards in current hand
 * @returns true - if present, false if not
 */
const includesAce11 = (hand) => {
  for (let card in hand) {
    if (card["value"] === 11) {
      return true;
    }
  }
  return false;
};

/**
 * Calculate the value of the cards in hand; checks if Ace should be used as 1 or 11
 * @param hand: array of cards in current hand
 * @returns sum of the value of cards in current hand
 */
const calculateSum = (hand) => {
  // Calculate the sum
  let sum = hand.reduce(
    (partialSum, currentCard) => partialSum + currentCard["value"],
    0
  );
  // Recalculate the sum with Ace card replaced with value of 1 if needed
  while (sum > 21 && includesAce11(hand)) {
    for (let index in hand) {
      if (hand[index]["value"] === 11) {
        hand[index]["value"] = 1;
        break;
      }
    }
    sum = hand.reduce(
      (partialSum, currentCard) => partialSum + currentCard["value"],
      0
    );
  }
  return sum;
};

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
  user["sum"] = calculateSum(user["hand"]);
}

/**
 *
 * @param {*} user
 * @param {*} divCards
 * @param {*} divSum
 * @param {*} revealAll
 */
const revealHand = (user, revealAll = false) => {
  const divCards = document.querySelector(user["cardsContainerId"]);
  const divSum = document.querySelector(user["sumContainerId"]);

  const numVisibleCards = divCards.children.length;
  const numCardsInHand = user["hand"].length;

  if (numCardsInHand > numVisibleCards) {
    for (count = numVisibleCards; count < numCardsInHand; count++) {
      const showCard = document.createElement("div");
      showCard.classList.add("card");
      if (revealAll || count === 0) {
        showCard.innerHTML = `<p>${user["hand"][count]["suit"]} ${user["hand"][count]["value"]}</p>`;
      } else {
        showCard.innerHTML = `<p>X</p>`;
      }
      divCards.appendChild(showCard);
    }
    if (revealAll) {
      divSum.innerText = user["sum"];
    } else {
      divSum.innerText = user["hand"][0]["value"];
    }
  }
};


const playGame = () => {
  btnsGame.appendChild(btnHit);
  btnsGame.appendChild(btnStand);
  btnsGame.removeChild(btnPlay);

  // Initialize available deck
  initializeDeck();
  console.log("Deck", deck);

  // Initialize the dealer and player hand with 2 cards
  drawCard(dealer, 2);
  drawCard(player, 2);
  console.log("Dealer", dealer);
  console.log("Player", player);

  revealHand(player, true);
  revealHand(dealer, false);
};

// Add Event listeners to buttons
btnPlay.addEventListener("click",playGame);
btnHit.addEventListener("click",function (){
    drawCard(player);
    revealHand(player, true);
});


