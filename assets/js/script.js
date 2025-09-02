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
    #dealBtnReplace;
    #bank;
    #bet;
    #chips;
    #game;
    #results;
    #resultsMessage;
    #resultsStats;
    #resultsWinnings;
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
      this.#dealBtnReplace = document.querySelector("#deal-btn-replace");
      this.#bank = document.querySelector("#bank-amount span");
      this.#bet = document.querySelector("#deal-amount span");
      this.#chips = document.querySelectorAll("button[data-type='chip']");
      this.#game = document.querySelector("#game-round");
      this.#results = document.querySelector("#results");
      this.#resultsMessage = document.querySelector("#results>.message>p");
      this.#resultsStats = document.querySelector("#results .game-stats");
      this.#resultsWinnings = document.querySelector("#results .winnings");
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
     * Function to update the deal area UI
     * @param {object} gameState
     */
    displayDeal(gameState) {
      this.#showNode(this.#intro, false);
      this.#showNode(this.#deal, true);
      this.#showNode(this.#game, false);
      this.#showNode(this.#results, false);

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
      if (gameState.betAmount <= 0) {
        this.#dealBtn.classList.add("hide");
        this.#dealBtnReplace.classList.remove("hide");
      } else {
        this.#dealBtn.classList.remove("hide");
        this.#dealBtnReplace.classList.add("hide");
      }
    }
    
    /**
     * Update game statistics modal content
     * @param {object} gameState - Game state object containing references to bank and gameResult
     */
    updateGameStats(gameState) {
        const sessionStats = document.getElementById('session-stats');
        const financialSummary = document.getElementById('financial-summary');
        const allTimeRecord = document.getElementById('all-time-record');

        // Update session stats - only update the stat-content div
        if (sessionStats) {
            let statContentDiv = sessionStats.querySelector('.stat-content');
            if (!statContentDiv) {
                // If stat-content doesn't exist, create it (append to existing card)
                statContentDiv = document.createElement('div');
                statContentDiv.classList.add('stat-content');
                sessionStats.appendChild(statContentDiv);
            }
            statContentDiv.innerHTML = `
                <p>Rounds Played: <span>${gameState.result.stats.rounds}</span></p>
                <p>Wins: <span>${gameState.result.stats.playerWins}</span></p>
                <p>Losses: <span>${gameState.result.stats.playerLosses}</span></p>
                <p>Draws: <span>${gameState.result.stats.draw}</span></p>
                <p>Win Rate: <span>${gameState.result.stats.rounds > 0 ? Math.round((gameState.result.stats.playerWins / gameState.result.stats.rounds) * 100) : 0}%</span></p>
            `;
        }

        // Update financial summary - only update the stat-content div
        if (financialSummary) {
            let statContentDiv = financialSummary.querySelector('.stat-content');
            if (!statContentDiv) {
                // If stat-content doesn't exist, create it (append to existing card)
                statContentDiv = document.createElement('div');
                statContentDiv.classList.add('stat-content');
                financialSummary.appendChild(statContentDiv);
            }
            
            const currentBalance = gameState.bank.getStatement();
            const startingBalance = 2000; // Your initial balance
            const netGain = currentBalance - startingBalance;
            
            statContentDiv.innerHTML = `
                <p>Current Balance: <span>£${currentBalance}</span></p>
                <p>Starting Balance: <span>£${startingBalance}</span></p>
                <p>Net ${netGain >= 0 ? 'Gain' : 'Loss'}: <span>£${Math.abs(netGain)}</span></p>
                <p>Biggest Win: <span>£${gameState.result.stats.biggestWin || 0}</span></p>
            `;
        }

        // Update all-time record - only update the stat-content div
        if (allTimeRecord) {
            let statContentDiv = allTimeRecord.querySelector('.stat-content');
            if (!statContentDiv) {
                // If stat-content doesn't exist, create it (append to existing card)
                statContentDiv = document.createElement('div');
                statContentDiv.classList.add('stat-content');
                allTimeRecord.appendChild(statContentDiv);
            }
            statContentDiv.innerHTML = `
                <p>Best Streak: <span>${gameState.result.stats.bestStreak || 0}</span></p>
                <p>Total Blackjacks: <span>${gameState.result.stats.totalBlackjacks || 0}</span></p>
                <p>Perfect Rounds: <span>${gameState.result.stats.perfectRounds || 0}</span></p>
            `;
        }
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
      let message = null;
      if (gameState.result.state.blackJack) {
        message = "Blackjack!!! You win.";
      } else if (gameState.result.state.dealerBust) {
        message = "Dealer Bust!!! You win.";
      } else if (gameState.result.state.playerBust) {
        message = "Bust!!! You lose.";
      } else if (gameState.result.state.playerWin) {
        message = "You win!!!";
      } else if (gameState.result.state.draw) {
        message = "Draw.";
      } else {
        message = "You lose!!!";
      }
      this.#resultsMessage.innerText = message;
      this.#resultsStats.innerHTML = "";
      const statWins = document.createElement("span");
      statWins.innerHTML = `Wins: ${gameState.result.stats.playerWins}/${gameState.result.stats.rounds}`;
      this.#resultsStats.appendChild(statWins);
      const statDraw = document.createElement("span");
      statDraw.innerHTML = `Draw: ${gameState.result.stats.draw}/${gameState.result.stats.rounds}`;
      this.#resultsStats.appendChild(statDraw);
      const statLosses = document.createElement("span");
      statLosses.innerHTML = `Losses: ${gameState.result.stats.playerLosses}/${gameState.result.stats.rounds}`;
      this.#resultsStats.appendChild(statLosses);

      this.#resultsWinnings.innerHTML = `Winnings: £${gameState.creditAmount}`;
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
    bank;
    result;
    creditAmount;

    constructor() {
      this.reset();
    }
    /**
     * Reset the flags to defaults for new game round
     */
    reset() {
      this.#gameOver = false;
      this.#stand = false;
      this.#betAmount = 0;
      this.creditAmount = 0;
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

  // Object to handle available funds in the game
  const bank = {
    totalAmount: 0,
    initialize: function (amount) {
      if (typeof amount === "number") {
        this.totalAmount = amount;
      } else {
        throw `bank=>TypeError! Expected number for amount:${amount}`;
      }
    },
    debit: function (amount) {
      if (typeof amount === "number") {
        this.totalAmount -= amount;
      } else {
        throw `bank=>TypeError: Numeric amount expected for ${amount}`;
      }
    },
    credit: function (amount) {
      if (typeof amount === "number") {
        this.totalAmount += amount;
      } else {
        throw `TypeError: Numeric amount expected for ${amount}`;
      }
    },
    getStatement: function () {
      return this.totalAmount;
    },
  };
  // Start game with £1000
  bank.initialize(2000);
  // Pass reference to bank for use from gameStateObject
  gameStateObject.bank = bank;

  // Object to track game results
  const gameResult = {
    rewardMultiplierMap: {
      blackJack: 3, // Return Bet + 2x Bet
      playerWin: 2, // Return Bet + 1x Bet
      draw: 1, // Return Bet
    },
    state: {
      blackJack: false,
      playerBust: false,
      dealerBust: false,
      playerWin: false,
      draw: false,
    },
    stats: {
      playerWins: 0,
      playerLosses: 0,
      draw: 0,
      rounds: 0,
      totalBlackjacks: 0,
      biggestWin: 0,
      bestStreak: 0,
      currentStreak: 0,
      perfectRounds: 0,
    },
    resetRound: function () {
      this.reward = 0;
      Object.keys(this.state).forEach((key) => {
        this.state[key] = false;
      });
    },
    resetAll: function () {
      this.resetRound();
      Object.keys(this.stats).forEach((key) => {
        this.stats[key] = 0;
      });
    },
    dealerBust: function () {
      this.state.dealerBust = true;
      this.state.playerWin = true;
      this.stats.playerWins++;
      this.stats.rounds++;
      this.stats.currentStreak++;
      if (this.stats.currentStreak > this.stats.bestStreak) {
        this.stats.bestStreak = this.stats.currentStreak;
      }
    },
    updateBiggestWin: function (winAmount) {
      if (winAmount > this.stats.biggestWin) {
        this.stats.biggestWin = winAmount;
      }
    },
    playerBust: function () {
      this.state.playerBust = true;
      this.stats.playerLosses++;
      this.stats.rounds++;
      this.stats.currentStreak = 0; // Reset streak on loss
    },
    blackJack: function () {
      this.state.blackJack = true;
      this.state.playerWin = true;
      this.stats.playerWins++;
      this.stats.rounds++;
      this.stats.totalBlackjacks++;
      this.stats.currentStreak++;
      if (this.stats.currentStreak > this.stats.bestStreak) {
        this.stats.bestStreak = this.stats.currentStreak;
      }
    },
    playerWin: function () {
      this.state.playerWin = true;
      this.stats.playerWins++;
      this.stats.rounds++;
      this.stats.currentStreak++;
      if (this.stats.currentStreak > this.stats.bestStreak) {
        this.stats.bestStreak = this.stats.currentStreak;
      }
    },
    dealerWin: function () {
      this.stats.playerLosses++;
      this.stats.rounds++;
      this.stats.currentStreak = 0; // Reset streak on loss
    },
    draw: function () {
      this.state.draw = true;
      this.stats.draw++;
      this.stats.rounds++;
      // Draw doesn't reset streak but doesn't increase it either
    },
    betMultiplier: function () {
      let multiplier = 0;
      Object.keys(this.state).forEach((key) => {
        if (
          this.state[key] &&
          Object.keys(this.rewardMultiplierMap).includes(key) &&
          this.rewardMultiplierMap[key] > multiplier
        ) {
          multiplier = this.rewardMultiplierMap[key];
        }
      });
      return multiplier;
    },
  };

  // Pass reference to gameResult for use from gameStateObject
  gameStateObject.result = gameResult;

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
    gameStateObject.creditAmount =
      gameResult.betMultiplier() * gameStateObject.betAmount;
    if (gameStateObject.creditAmount) {
      bank.credit(gameStateObject.creditAmount);
      // Track biggest win (winnings minus original bet)
      const netWin = gameStateObject.creditAmount - gameStateObject.betAmount;
      if (netWin > 0) {
        gameResult.updateBiggestWin(netWin);
      }
    }
  };

  /**
   * Check the game results
   */
  const checkResults = () => {
    if (!gameStateObject.stand) {
      if (player.sum > 21) {
        gameStateObject.gameOver = true;
        gameResult.playerBust();
      } else if (player.sum === 21) {
        gameStateObject.gameOver = true;
        // Check if the hand includes Ace for blackjack
        if (player.hand.length == 2 && player.handIncludesAce11()) {
          gameResult.blackJack();
        } else {
          gameResult.playerWin();
        }
      }
    } else {
      gameStateObject.gameOver = true;
      if (dealer.sum > 21) {
        gameResult.dealerBust();
      } else if (dealer.sum > player.sum) {
        gameResult.dealerWin();
      } else if (dealer.sum === player.sum) {
        gameResult.draw();
      } else if (dealer.sum < player.sum) {
        gameResult.playerWin();
      } else {
        throw `checkResults=>Invalid condition! dealer sum=>${dealer.sum}, player sum=>${player.sum}`;
      }
    }

    if (gameStateObject.gameOver) {
      handlePayout();
      gameUI.displayResults(gameStateObject);
      // Update the statistics modal with latest stats
      gameUI.updateGameStats(gameStateObject);
    }
  };

  /**
   * Start the game
   */
  const playGame = () => {
    // Switch to game User interface
    gameUI.displayGameArea(gameStateObject);

    console.log("DEBUG: Deck", gameDeck.showCurrentDeck());

    // Initialize the dealer and player hand with 2 cards
    drawCard(dealer, 2);
    drawCard(player, 2);

    checkResults();
  };

  /**
   *
   */
  const placeBet = () => {
    //Switch to the deal area interface
    gameUI.displayDeal(gameStateObject);
  };

  /**
   * ----------------------------------------------
   * EVENT HANDLERS
   * ----------------------------------------------
   */
  // Remove focus from any focused element within the modal before it closes
  document.querySelectorAll(".modal").forEach((modal)=>{
    modal.addEventListener("hide.bs.modal", function (event) {
      const focusedElement = document.activeElement;
      if (this.contains(focusedElement)) {
        focusedElement.blur();
      }
    });
  });

  // Update game statistics modal when it's opened
  document
    .getElementById("game-statistics")
    .addEventListener("show.bs.modal", function (event) {
      gameUI.updateGameStats(gameStateObject);
    });

  // Add event listeners for buttons
  const buttons = document.querySelectorAll("button");
  buttons.forEach((button) => {
    if (button.getAttribute("data-type") !== "button-bs-modal") {
      button.addEventListener("click", function (event) {
        if (this.getAttribute("data-type") === "game-start") {
          placeBet();
        } else if (this.getAttribute("data-type") === "deal") {
          playGame();
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
          // Resets for new round
          gameStateObject.reset();
          gameResult.resetRound();
          dealer.clearHand();
          player.clearHand();
          gameDeck.initializeDeck();

          placeBet();
        } else if (this.getAttribute("data-type") === "chip") {
          const chipValue = parseInt(this.getAttribute("data-chip-value"));
          if (bank.getStatement() >= chipValue) {
            bank.debit(chipValue);
            gameStateObject.raiseBet = chipValue;
          }
          gameUI.displayDeal(gameStateObject);
        } else if (this.getAttribute("data-type") === "reset-bet") {
          bank.credit(gameStateObject.betAmount);
          gameStateObject.resetBet();
          gameUI.displayDeal(gameStateObject);
        } else {
          alert(`Unimplememted feature: ${this.getAttribute("data-type")}`);
          throw `Unimplememted feature: ${this.getAttribute("data-type")}`;
        }
      });
    }
  });
});
