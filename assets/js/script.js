// Wait for DOM contents to be loaded
document.addEventListener("DOMContentLoaded", function () {
  /**
   * ----------------------------------------------
   * CUSTOM CLASS DECLARATIONS
   * ----------------------------------------------
   */
  /** Class to handle user interface management */
  class uiManager {
    // Private fields pointing to UI relevant DOM elements
    #intro;
    #deal;
    #dealBtn;
    #bank;
    #bet;
    #chips;
    #game;
    #results;
    #resultsMessage;
    #resultsStats;
    #gameControls;
    #playerCards;
    #playerSum;
    #dealerCards;
    #dealerSum;
    #gameBetDisplay;

    /**
     * Uses query selectors to assign pointers to relevant DOM nodes
     */
    constructor() {
      this.#intro = document.querySelector("#intro");
      this.#deal = document.querySelector("#deal");
      this.#dealBtn = document.querySelector("#deal-button");
      this.#bank = document.querySelector("#bank-amount span");
      this.#bet = document.querySelector("#deal-amount span");
      this.#chips = document.querySelectorAll("button[data-type='chip']");
      this.#game = document.querySelector("#game-round");
      this.#results = document.querySelector("#results");
      this.#resultsMessage = document.querySelector("#results>.message>p");
      this.#resultsStats = document.querySelector("#results>.message>.game-stats");
      this.#gameControls = document.querySelector("#btns-game");
      this.#playerCards = document.querySelector("#player-cards");
      this.#playerSum = document.querySelector("#player-sum");
      this.#dealerCards = document.querySelector("#dealer-cards");
      this.#dealerSum = document.querySelector("#dealer-sum");
      this.#gameBetDisplay = document.querySelector("#game-bet-display span");

      this.displayIntro();
    }
    //Private utility methods
    /**
     * Private method to show/hide DOM nodes
     * @param {boolean} show - true to show/false to hide
     * @param {object} node - DOM node
     */
    #showNode(node, show) {
      if (typeof show === "boolean" && node) {
        show ? node.classList.remove("hide") : node.classList.add("hide");
      } else if (!node) {
        throw "Value expected for node";
      } else {
        throw new TypeError("Boolean value expected for show");
      }
    }

    // Public methods
    /**
     * Public method to display Intro/Welcome screen
     */
    displayIntro() {
      this.#showNode(this.#intro, true);
      this.#showNode(this.#deal, false);
      this.#showNode(this.#game, false);
      this.#showNode(this.#results, false);
    }
    /**
     * Public method to display Intro/Welcome screen
     */
    displayDeal() {
      this.#showNode(this.#intro, false);
      this.#showNode(this.#deal, true);
      this.#showNode(this.#game, false);
      this.#showNode(this.#results, false);
    }
    /**
     * Function to update the deal area UI
     * @param {object} gameState
     */
    updateDeal(gameState) {
      this.#bank.innerText = `${gameState.bank.getStatement()}`;
      this.#bet.innerText = `${gameState.betAmount}`;

      // Disable chips based on amount left in bank
      this.#chips.forEach((chip) => {
        if (
          parseInt(chip.getAttribute("data-chip-value")) >
          gameState.bank.getStatement()
        ) {
          chip.disabled = true;
        } else {
          chip.disabled = false;
        }
      });
      // Disable Deal button if bet is not placed
      gameState.betAmount <= 0
        ? this.#dealBtn.classList.add("hide")
        : this.#dealBtn.classList.remove("hide");
    }
    /**
     * Public method to display Game screen
     */
    displayGameArea(gameState) {
      this.#showNode(this.#intro, false);
      this.#showNode(this.#deal, false);
      this.#showNode(this.#game, true);
      this.#showNode(this.#gameControls, true);
      this.#showNode(this.#results, false);

      this.#gameBetDisplay.innerText = gameState.betAmount;
    }
    /**
     * Public method to display Results modal
     * @param {string} result - Message to be displayed
     */
    displayResults(gameState) {
      this.#showNode(this.#gameControls, false);
      this.#showNode(this.#results, true);
      const gameResult = gameState.gameResult();
      let message = null;
      if (gameResult.blackJack) {
        message = "Blackjack!!! You win.";
      } else if (gameResult.dealerBust) {
        message = "Dealer Bust!!! You win.";
      } else if (gameResult.playerBust) {
        message = "Bust!!! You lose.";
      } else if (gameResult.playerWin) {
        message = "You win!!!";
      } else if (gameResult.draw) {
        message = "Draw.";
      } else {
        message = "You lose!!!";
      }
      this.#resultsMessage.innerText = message;
      this.#resultsStats.innerHTML="";
      const statWins = document.createElement("span");
      statWins.innerHTML = `Wins: ${gameResult.wins}/${gameResult.rounds}`;
      this.#resultsStats.appendChild(statWins);
      const statLosses = document.createElement("span");
      statLosses.innerHTML = `Losses: ${gameResult.losses}/${gameResult.rounds}`;
      this.#resultsStats.appendChild(statLosses);
    }
    /**
     * Public method to display game control buttons
     */
    displayGameControls() {
      this.#showNode(this.#gameControls, true);
      this.#showNode(this.#results, false);
    }
    /**
     * Display the cards for the user on game screen
     * @param {user} user - object of user class
     */
    revealHand(user) {
      const divCards =
        user.id === "dealer" ? this.#dealerCards : this.#playerCards;
      const divSum = user.id === "dealer" ? this.#dealerSum : this.#playerSum;

      // Empty the elements within the divs
      divCards.innerHTML = "";
      divSum.innerHTML = "";

      user.hand.forEach((card) => {
        const showCard = document.createElement("div");
        showCard.classList.add("card-show");
        showCard.classList.add("drop-shadow");
        if (user.revealAllCards || user.hand.indexOf(card) === 0) {
          const cardImage = `assets/images/svg-cards/${card["number"]}_of_${card["suit"]}.svg`;
          // showCard.innerHTML = `<p>${cardImage}</p>`;
          showCard.style.backgroundImage = `url(${cardImage})`;
          if (user.hand.indexOf(card) < user.hand.length - 1) {
            showCard.classList.add("card-show-partial");
          }
        } else {
          const cardImage = `assets/images/svg-cards/card-back.svg`;
          showCard.style.backgroundImage = `url(${cardImage})`;
          // showCard.innerHTML = `<p>X</p>`;
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
      this.#suits = ["hearts", "spades", "diamonds", "clubs"];
      this.#cardNumbers = [
        "ace",
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        "jack",
        "queen",
        "king",
      ];
      this.#cardValues = [11, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];
      this.initializeDeck();
    }
    /**
     * Populates private deck[] with available cards
     */
    initializeDeck() {
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
     * Draws cards out of the deck - the drawn cards are removed from the deck
     * @param {*} numCardsToDraw - number of cards to draw
     * @returns {array} - Array with drawn card objects
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
    /**
     * Returns the current deck
     * @returns {array} current deck with the cards present
     */
    showCurrentDeck() {
      return this.#deck;
    }
  }

  /**
   * Class to represent each user(dealer and player)
   */
  class user {
    #id;
    #revealAllCards;
    #hand;
    #sum;

    constructor(id) {
      if (id === "dealer" || id === "player") {
        this.#id = id;
        this.clearHand(id);
      } else {
        throw `Invalid value for id: ${id}`;
      }
    }

    /**
     * Resets the hand[], sum and revealAllCards values
     */
    clearHand() {
      this.#hand = [];
      this.#sum = 0;
      this.#id === "dealer"
        ? (this.#revealAllCards = false)
        : (this.#revealAllCards = true);
    }
    /**
     * Checks if the current hand includes Ace card counted with a value of 11
     * @returns {boolean} true if present/false if not
     */
    handIncludesAce11() {
      for (let card of this.#hand) {
        if (card["value"] === 11) {
          return true;
        }
      }
      return false;
    }

    /**
     * Calculates the sum of the values of cards in current hand and sets #sum
     */
    #calculateSumOfHand() {
      // Calculate the sum
      let sum = this.#hand.reduce(
        (partialSum, currentCard) => partialSum + currentCard["value"],
        0
      );
      // Recalculate the sum with Ace card replaced with value of 1 if needed
      while (sum > 21 && this.handIncludesAce11()) {
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
     * Adds cards to users current hand
     * @param {array} cards - array of card objects to be added
     */
    addCardsToHand(cards) {
      // TODO: add error checks for data type of hand
      cards.forEach((card) => {
        this.#hand.push(card);
      });
      this.#calculateSumOfHand();
    }
    /**
     * Accessor to return the current sum of hand
     */
    get sum() {
      return this.#sum;
    }

    /**
     * Accessor to return user id
     */
    get id() {
      return this.#id;
    }

    /**
     * Accessor to return the current hand
     */
    get hand() {
      return this.#hand;
    }

    /**
     * Accessor to check if all cards in the hand can be revealed
     */
    get revealAllCards() {
      return this.#revealAllCards;
    }

    /**
     * Accessor to set if cards can be revealed
     */
    set revealAllCards(show) {
      this.#revealAllCards = show;
    }
  }

  /**
   *
   */
  class gameState {
    // Private fields
    #gameOver;
    #stand;
    #betAmount;
    #isBlackJack;
    #isPlayerWin;
    #isDealerBust;
    #isPlayerBust;
    #isDraw;
    #countPlayerWin;
    #countPlayerLoss;
    #countGames;
    bank;
    payoutMap;

    constructor() {
      this.resetAll();
    }
    /**
     * 
     */
    resetAll() {
      this.#countGames = 0;
      this.#countPlayerWin = 0;
      this.#countPlayerLoss = 0;
      this.gameReset();
    }
    /**
     * Reset the flags to defaults for current game
     */
    gameReset() {
      this.#gameOver = false;
      this.#stand = false;
      this.#betAmount = 0;
      this.#isBlackJack = false;
      this.#isPlayerWin = false;
      this.#isDealerBust = false;
      this.#isPlayerBust = false;
      this.#isDraw = false;
    }

    set gameOver(isOver) {
      if (typeof isOver !== "boolean") {
        throw new TypeError("isOver value must be boolean");
      } else {
        this.#gameOver = isOver;
      }
    }

    get gameOver() {
      return this.#gameOver;
    }

    set stand(isStand) {
      if (typeof isStand !== "boolean") {
        throw new TypeError("isStand value must be boolean");
      } else {
        this.#stand = isStand;
      }
    }

    get stand() {
      return this.#stand;
    }

    resetBet() {
      this.#betAmount = 0;
    }

    set raiseBet(amount) {
      if (typeof amount === "number") {
        this.#betAmount += amount;
      } else {
        throw `TypeError: Expected number for amount ${amount}`;
      }
    }
    get betAmount() {
      return this.#betAmount;
    }
    dealerBust() {
      this.#isDealerBust = true;
      this.#isPlayerWin = true;
      this.#countPlayerWin++;
      this.#countGames++;
    }
    playerBust() {
      this.#isPlayerBust = true;
      this.#isPlayerWin = false;
      this.#countPlayerLoss++;
      this.#countGames++;
    }
    blackJack() {
      this.#isBlackJack = true;
      this.#isPlayerWin = true;
      this.#countPlayerWin++;
      this.#countGames++;
    }
    playerWin() {
      this.#isPlayerWin = true;
      this.#countPlayerWin++;
      this.#countGames++;
    }
    dealerWin() {
      this.#isPlayerWin = false;
      this.#countPlayerLoss++;
      this.#countGames++;
    }
    draw(message) {
      this.#isDraw = true;
      this.#countGames++;
    }
    gameResult() {
      return {
        playerWin: this.#isPlayerWin,
        dealerBust: this.#isDealerBust,
        playerBust: this.#isPlayerBust,
        blackJack: this.#isBlackJack,
        draw: this.#isDraw,
        wins: this.#countPlayerWin,
        losses: this.#countPlayerLoss,
        rounds: this.#countGames,
      };
    }
  }

  /**
   * ----------------------------------------------
   * GLOBAL OBJECT INSTANCES
   * ----------------------------------------------
   */
  const gameUI = new uiManager();
  const gameDeck = new deckManager();
  const dealer = new user("dealer");
  const player = new user("player");
  const gameStateObject = new gameState();

  // Object to track bets in the game
  const bank = {
    totalAmount: 1000,
    debit: function (amount) {
      if (typeof amount === "number") {
        this.totalAmount -= amount;
      } else {
        throw `TypeError: Numeric amount expected for ${amount}`;
      }
    },
    credit: function (amount) {
      if (typeof amount === "number") {
        this.totalAmount += amount;
      } else {
        throw `TypeError: Numeric amount expected for ${amount}`;
      }
    },
    denominationAvailable: function (denomination) {
      if (typeof denomination === "number") {
        return this.totalAmount >= denomination ? true : false;
      } else {
        throw `TypeError: Numeric amount expected for ${denomination}`;
      }
    },
    getStatement: function () {
      return this.totalAmount;
    },
  };

  // Point gameStateObject to use bank object
  gameStateObject.bank = bank;

  // Enum type object to map payout factors on bets 
  const payoutMap = {
    "blackJack":2,
    "win":1,
    "draw":0,
  }

  // Point gameStateObject to use payout mappings
  gameStateObject.payoutMap = payoutMap;

  /**
   * ----------------------------------------------
   * GAME FUNCTIONS
   * ----------------------------------------------
   */
  /**
   * Draw deck from the deck and add it to user's hand
   * @param {*} user: global object to add the drawn deck to
   * @param {*} numCardsToDraw : number of deck to draw from the deck
   */
  const drawCard = (user, numCardsToDraw = 1) => {
    user.addCardsToHand(gameDeck.drawCards(numCardsToDraw));
    gameUI.revealHand(user);

    console.log("DEBUG: Deck", gameDeck.showCurrentDeck());
    console.log("DEBUG:", user);
  };

  /**
   * Handle payouts
   */
  const handlePayout = () => {
    const result = gameStateObject.gameResult();
    if(result.blackJack){
      gameStateObject.bank.credit(gameStateObject.betAmount * 3);
    } else if(result.playerWin){
      gameStateObject.bank.credit(gameStateObject.betAmount * 2);
    } else if(result.draw){
      gameStateObject.bank.credit(gameStateObject.betAmount);
    }
  }

  /**
   * Check the game results
   */
  const checkResults = () => {
    let result = null;
    let isBlackJack = false;

    if (!gameStateObject.stand) {
      if (player.sum > 21) {
        // Check if player is Bust!
        gameStateObject.gameOver = true;
        gameStateObject.playerBust();
      } else if (player.sum === 21) {
        if (
          player.hand.length == 2 &&
          player.handIncludesAce11()
        ) {
          // Check if the hand includes Ace for blackjack
          gameStateObject.blackJack();
        } else {
          // Player wins
          gameStateObject.playerWin();
        }
        gameStateObject.gameOver = true;
      }
    } else {
      gameStateObject.gameOver = true;
      if (dealer.sum > 21) {
        gameStateObject.dealerBust();
      } else if (dealer.sum > player.sum) {
        gameStateObject.dealerWin();
      } else if (dealer.sum === player.sum) {
        gameStateObject.draw();
      } else if (dealer.sum < player.sum) {
        gameStateObject.playerWin();
      } else {
        result = "Invalid condition";
        throw `${result}: dealer sum=>${dealer.sum}, player sum=>${player.sum}`;
      }
    }

    if (gameStateObject.gameOver) {
      handlePayout();
      gameUI.displayResults(gameStateObject);
    }
  };


  /**
   * Start the game
   */
  const playGame = (gameState) => {
    // Switch to game User interface
    gameUI.displayGameArea(gameState);

    console.log("DEBUG: Deck", gameDeck.showCurrentDeck());

    // Initialize the dealer and player hand with 2 cards
    drawCard(dealer, 2);
    drawCard(player, 2);

    checkResults();
  };

  const placeBet = (gameState) => {
    //Switch to the deal area interface
    gameUI.displayDeal();
    gameUI.updateDeal(gameState);
  };

  /**
   * ----------------------------------------------
   * EVENT HANDLERS
   * ----------------------------------------------
   */

  // Add event listeners for buttons
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    if (button.getAttribute("data-type") !== "button-bs-modal") {
      button.addEventListener("click", function (event) {
        if (this.getAttribute("data-type") === "game-start") {
          placeBet(gameStateObject);
        } else if (this.getAttribute("data-type") === "deal") {
          playGame(gameStateObject);
        } else if (this.getAttribute("data-type") === "hit") {
          drawCard(player);
          checkResults();
        } else if (this.getAttribute("data-type") === "stand") {
          gameStateObject.stand = true;
          dealer.revealAllCards = true;
          gameUI.revealHand(dealer);
          while (dealer.sum < 17) {
            drawCard(dealer);
          }
          checkResults();
        } else if (this.getAttribute("data-type") === "play-again") {
          dealer.clearHand();
          player.clearHand();
          gameStateObject.gameReset();

          gameDeck.initializeDeck();
          // playGame();
          placeBet(gameStateObject);
        } else if (this.getAttribute("data-type") === "chip") {
          const chipValue = parseInt(this.getAttribute("data-chip-value"));
          if (gameStateObject.bank.getStatement() >= chipValue) {
            gameStateObject.bank.debit(chipValue);
            gameStateObject.raiseBet = chipValue;
          }
          gameUI.updateDeal(gameStateObject);
        } else if (this.getAttribute("data-type") === "reset-bet") {
          gameStateObject.bank.credit(gameStateObject.betAmount);
          gameStateObject.resetBet();
          gameUI.updateDeal(gameStateObject);
        } else {
          alert(`Unimplememted feature: ${this.getAttribute("data-type")}`);
          throw `Unimplememted feature: ${this.getAttribute("data-type")}`;
        }
      });
    }
  });
});
