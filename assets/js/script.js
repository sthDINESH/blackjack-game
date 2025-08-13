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
      user.id === "dealer" ? this.#dealerCards : this.#playerCards;
    const divSum = user.id === "dealer" ? this.#dealerSum : this.#playerSum;
    
    // Empty the elements within the divs
    divCards.innerHTML = "";
    divSum.innerHTML = "";

    user.hand.forEach((card) => {
      const showCard = document.createElement("div");
      showCard.classList.add("card");
      if (user.revealAllCards || user.hand.indexOf(card) === 0) {
        showCard.innerHTML = `<p>${card["suit"]} ${card["value"]}</p>`;
      } else {
        showCard.innerHTML = `<p>X</p>`;
      }
      divCards.appendChild(showCard);
    });

    if (user.revealAllCards) {
      divSum.innerText = user.sum;
    } else {
      divSum.innerText = user.hand[0]["value"];
    }
  }
}

const gameUI = new uiManager();

/**
 * Class for managing card deck in the game
 */
class deckManager {
  // Private fields
  #suits;
  #cardNumbers;
  #cardValues;
  #deck;

  /**
   * Initializes the deck with available cards for the game(single deck of 52 cards)
   */
  constructor() {
    this.#suits = ["Heart", "Spade", "Diamond", "Club"];
    this.#cardNumbers = [
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
    this.#cardValues = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
    this.initializeDeck();
  }

  initializeDeck(){
    this.#deck = [];
    for (let suit of this.#suits) {
      for (let index = 0; index < this.#cardValues.length; index++) {
        this.#deck.push({
          suit: suit,
          number: this.#cardNumbers[index],
          value: this.#cardValues[index],
        });
      }
    }
  }

  /**
   *
   * @param {*} numCardsToDraw
   * @returns
   */
  drawCards(numCardsToDraw = 1) {
    const cards = [];
    for (let count = 0; count < numCardsToDraw; count++) {
      // Pick a card at random index from the deck
      let index = Math.floor(Math.random() * this.#deck.length);
      // Add the card to be returned
      cards.push(this.#deck[index]);
      // Remove the card from the deck
      this.#deck.splice(index, 1);
    }
    return cards;
  }

  showCurrentDeck() {
    return this.#deck;
  }
}

const gameDeck = new deckManager();

/**
 * Class to represent each user(dealer and player)
 */
class user {
  #id;
  #revealAllCards;
  #hand;
  #sum;

  constructor(id) {
    this.#id = id;
    this.clearHand(id);
  }

  clearHand(){
    // TODO: add error checking for id values
    this.#hand = [];
    this.#sum = 0;
    this.#id === "dealer"
      ? (this.#revealAllCards = false)
      : (this.#revealAllCards = true);
  }
  /**
   *
   * @param {*} hand
   * @returns
   */
  #handIncludesAce11() {
    for (let card of this.#hand) {
      if (card["value"] === 11) {
        return true;
      }
    }
    return false;
  }

  /**
   *
   */
  #calculateSumOfHand() {
    // Calculate the sum
    let sum = this.#hand.reduce(
      (partialSum, currentCard) => partialSum + currentCard["value"],
      0
    );
    // Recalculate the sum with Ace card replaced with value of 1 if needed
    while (sum > 21 && this.#handIncludesAce11()) {
      for (let index in this.#hand) {
        if (this.#hand[index]["value"] === 11) {
          this.#hand[index]["value"] = 1;
          break;
        }
      }
      sum = this.#hand.reduce(
        (partialSum, currentCard) => partialSum + currentCard["value"],
        0
      );
    }
    this.#sum = sum;
  }

  /**
   *
   */
  addCardsToHand(cards) {
    // TODO: add error checks for data type of hand
    cards.forEach((card) => {
      this.#hand.push(card);
    });
    this.#calculateSumOfHand();
    console.log(`${this.#id} ${this.#hand} ${this.#sum}`);
  }

  get sum(){
    return this.#sum;
  }

  get id(){
    return this.#id;
  }

  get hand(){
    return this.#hand;
  }

  get revealAllCards(){
    return this.#revealAllCards;
  }

  set revealAllCards(show){
    this.#revealAllCards = show;
  }
}
// Global objects to store player and dealer details
const dealer = new user("dealer");
const player = new user("player");

let gameOver = false;
let stand = false;

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
  user.addCardsToHand(gameDeck.drawCards(numCardsToDraw));
  console.log("Deck", gameDeck.showCurrentDeck());
  gameUI.revealHand(user);
}

const checkResults = () => {
  let result = null;

  if (!stand) {
    if (player.sum > 21) {
      // Check if player is Bust!
      result = "Bust! You lose.";
      gameOver = true;
    } else if (player.sum == 21) {
      //
      result = "You win!";
      gameOver = true;
    }
  } else {
    gameOver = true;
    if (dealer.sum > 21) {
      result = "Dealer Bust! You win.";
    } else if (player.sum > dealer.sum) {
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
  gameDeck.initializeDeck();
  console.log("Deck", gameDeck.showCurrentDeck());

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
          dealer.revealAllCards = true;
          gameUI.revealHand(dealer);
          while (dealer.sum < 17) {
            drawCard(dealer);
          }
          checkResults();
        } else if (this.getAttribute("data-type") === "play-again") {
          dealer.clearHand();
          player.clearHand();

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
