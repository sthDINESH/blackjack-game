/** Class to handle user interface management */
class uiManager {
  // Private fields pointing to UI relevant DOM elements
  #intro;
  #deal;
  #game;
  #results;
  #gameControls;
  #playerCards;
  #playerSum;
  #dealerCards;
  #dealerSum;

  constructor() {
    this.#intro = document.querySelector("#intro");
    this.#deal = document.querySelector("#deal");
    this.#game = document.querySelector("#game-round");
    this.#results = document.querySelector("#results");
    this.#gameControls = document.querySelector("#btns-game");
    this.#playerCards = document.querySelector("#player-cards");
    this.#playerSum = document.querySelector("#player-sum");
    this.#dealerCards = document.querySelector("#dealer-cards");
    this.#dealerSum = document.querySelector("#dealer-sum");

    this.displayIntro();
  }

  #showIntro(show) {
    show
      ? this.#intro.classList.remove("hide")
      : this.#intro.classList.add("hide");
  }

  #showDeal(show) {
    show
      ? this.#deal.classList.remove("hide")
      : this.#deal.classList.add("hide");
  }

  #showGame(show) {
    show
      ? this.#game.classList.remove("hide")
      : this.#game.classList.add("hide");
  }

  #showResults(show) {
    show
      ? this.#results.classList.remove("hide")
      : this.#results.classList.add("hide");
  }

  #showGameControls(show) {
    show
      ? this.#gameControls.classList.remove("hide")
      : this.#gameControls.classList.add("hide");
  }

  // Public methods
  displayIntro() {
    this.#showIntro(true);
    this.#showDeal(false);
    this.#showGame(false);
    this.#showResults(false);
  }

  displayGameArea() {
    this.#showIntro(false);
    this.#showDeal(false);
    this.#showGame(true);
    this.#showGameControls(true);
    this.#showResults(false);
  }

  displayResults(result) {
    this.#showResults(true);
    this.#showGameControls(false);
    this.#results.firstElementChild.innerText = result;
  }

  displayGameControls() {
    this.#showResults(false);
    this.#showGameControls(true);
  }

  revealHand(user) {
    const divCards =
      user["id"] === "dealer" ? this.#dealerCards : this.#playerCards;
    const divSum = user["id"] === "dealer" ? this.#dealerSum : this.#playerSum;
    // const divCards = document.querySelector(user["cardsContainerId"]);
    // const divSum = document.querySelector(user["sumContainerId"]);
    // Empty the elements within the divs
    divCards.innerHTML = "";
    divSum.innerHTML = "";

    user["hand"].forEach((card) => {
      const showCard = document.createElement("div");
      showCard.classList.add("card");
      if (user["reveal"] || user["hand"].indexOf(card) === 0) {
        showCard.innerHTML = `<p>${card["suit"]} ${card["value"]}</p>`;
      } else {
        showCard.innerHTML = `<p>X</p>`;
      }
      divCards.appendChild(showCard);
    });

    if (user["reveal"]) {
      divSum.innerText = user["sum"];
    } else {
      divSum.innerText = user["hand"][0]["value"];
    }
  }
}

const gameUI = new uiManager();

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
let deck = [];

// Global objects to store player and dealer details
const dealer = {};
const player = {};

dealer["reveal"] = false;
dealer["id"] = "dealer";

player["reveal"] = true;
player["id"] = "player";

let gameOver = false;
let stand = false;

/**
 * Function to initialize global deck[] with the deck available in the game
 *  */
function initializeDeck() {
  deck = [];
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

  gameUI.revealHand(user);
}

const checkResults = () => {
  let result = null;

  if (!stand) {
    if (player["sum"] > 21) {
      // Check if player is Bust!
      result = "Bust! You lose.";
      gameOver = true;
    } else if (player["sum"] == 21) {
      //
      result = "You win!";
      gameOver = true;
    }
  } else {
    gameOver = true;
    if (dealer["sum"] > 21) {
      result = "Dealer Bust! You win.";
    } else if (player["sum"] > dealer["sum"]) {
      result = "You win.";
    } else {
      result = "Dealer wins.";
    }
  }

  if (gameOver) {
    gameUI.displayResults(result);
  }
};

const playGame = () => {
  // Switch to game User interface
  gameUI.displayGameArea();

  // Initialize available deck
  initializeDeck();
  console.log("Deck", deck);

  // Initialize the dealer and player hand with 2 cards
  drawCard(dealer, 2);
  drawCard(player, 2);
  console.log("Dealer", dealer);
  console.log("Player", player);

  checkResults();
};

// Wait for DOM contents to be loaded
document.addEventListener("DOMContentLoaded", function () {
  // Add event listeners for buttons
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    if (button.getAttribute("data-type") !== "button-bs-modal") {
      button.addEventListener("click", function (event) {
        if (this.getAttribute("data-type") === "game-start") {
          playGame();
        } else if (this.getAttribute("data-type") === "hit") {
          drawCard(player);
          console.log("Player", player);
          checkResults();
        } else if (this.getAttribute("data-type") === "stand") {
          stand = true;
          dealer["reveal"] = true;
          gameUI.revealHand(dealer);
          while (dealer["sum"] < 17) {
            drawCard(dealer);
          }
          checkResults();
        } else if (this.getAttribute("data-type") === "play-again") {
          delete player.hand;
          delete player.sum;

          delete dealer.hand;
          delete dealer.sum;
          dealer.reveal = false;

          gameOver = false;
          stand = false;

          playGame();
        } else {
          alert(`Unimplememted feature: ${this.getAttribute("data-type")}`);
          throw `Unimplememted feature: ${this.getAttribute("data-type")}`;
        }
      });
    }
  });
});
