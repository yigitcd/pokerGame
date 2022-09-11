// server-side game logic for a texas hold 'em game
const Deck = require('./Deck.js');
const Player = require('./Player.js');
const _ = require('lodash');
const Hand = require('pokersolver').Hand;

const Game = function (io, name, blind) {
    this.deck = new Deck();
    this.players = [];
    this.gameName = name;
    this.smallBlind = blind;
    this.bigBlind = this.smallBlind * 2;
    this.timeoutTime = 10000;
    this.stageNumber = 0;
    this.cardsPerPlayer = 2;
    this.currentActivePlayerSlot = 0;
    this.stageLastPlayer = 0;
    this.disconnectedPlayers = [];
    this.gameNumber = 0;
    this.timeoutData;
    this.maxPlayer = 5;

    this.roundBets = [];
    this.roundData = {};
    this.gameStatus = "On-Wait";
    const constructor = (function () { })(this);


    this.gameStarter = (admin) => {
        if (this.gameStatus === "On-Wait") {
            if (this.getNumPlayers() > 1) {
                this.gameStatus = "On-Start";
                console.log('Game Will Start in 5 Sec');
                this.gameUpdatePublish();
                setTimeout(x => this.gameStarter(true), 5000);
            } else {
                console.log('Dont Have Enought Players To Start Game', this.getNumPlayers());
            }
        }

        if (this.gameStatus === "On-Start" && admin) {
            if (this.getNumPlayers() > 1) {
                this.gameStart();
            } else {
                this.gameStatus = "On-Wait";
            }
        }

    };


    this.gameStart = () => {
        if (this.players.length > 0) {
            console.log('Game Started', this.gameNumber);
            this.gameStatus = "On-Started"
            this.stageNumber = 0;
            this.setDealer();
            this.assignBlinds();
            this.dealCards();
            this.gameNumber++;
            this.nextStage();
        }
    }

    this.nextStage = () => {

        this.stageNumber++;
        if(stageNumber === 1) {
            this.nextPlayer();
        }

        if(stageNumber === 2) { // Floop

        }

        if(stageNumber === 3) { // Turn
            
        }

        if(stageNumber === 4) { // River
            
        }

    }

    this.nextPlayer = () => {
        const allPlayers = this.getPlayersInStage(this.stageNumber)
        if (allPlayers.length < 2) {
            console.log('Session End No Player')
        } else {
            const findActivePlayer = this.findPlayerInSeat(this.currentActivePlayerSlot)
            if (findActivePlayer) {
                if (currentRoundLastPlayerSlot === findActivePlayer.seat) {
                      this.nextStage();
                } else {
                    this.waitActFromPlayer(findActivePlayer.seat, this.stageNumber)
                }
            } else {
                this.nextPlayer();
            }
        }
    }

    this.getLastPlayerOfStage = () => {
        _.last(this.players.sort((a, b) => { a.seat - b.seat }));
    }


    this.waitActFromPlayer = (playerSlot, stageNumber) => {
        console.log('Timeout Receive', playerSlot, stageNumber)
        if (playerSlot === this.currentActivePlayerSlot && stageNumber === this.stageNumber) {
            this.timeoutPlayer(playerSlot, stageNumber);
        }
    }

    this.timeoutPlayer = (playerSlot, stageNumber) => {
        const findPlayer = this.players.find(x => x.seat === playerSlot);
        console.log('TimeoutPlayer', playerSlot);
        if (findPlayer && stageNumber === this.stageNumber) {
            const stageHasBet = this.getStageBet(this.stageNumber)
            if (stageHasBet > 0) {
                findPlayer.status = 'Fold';
            } else {
                findPlayer.status = 'Check';
            }
            this.nextPlayer();
        } else {
            console.log('Timeout Error player!')
        }
    }


    this.roundPlayerFinder = (stage) => {
        const oldCheck = [];
        const inGamePlayers = this.getPlayersInStage(stage);
        const prevPlayer = inGamePlayers.findIndex(x => x.seat === prevSeat);
        const nextPlayerSeat = inGamePlayers[prevPlayer + 1] ? inGamePlayers[prevPlayer + 1].seat : inGamePlayers[0].seat;
        const getPlayer = this.players.find(x => x.seat === nextPlayerSeat);
        const nonFold = this.getNonFoldPlayers();
        if (getPlayer.status === 'Fold' || getPlayer.allIn) {
            return this.findNextPlayer(getPlayer.seat)
        } else {
            return getPlayer.seat;
        }
    }

    this.findPlayerInSeat = (Seat) => {
        return this.players.find(x => x.seat === Seat && x.playerStage === this.stage)
    }

    this.findNextSeat = (playerList, prevSeat) => {
        const prevIndex = playerList.findIndex(x => x.seat === prevSeat);
        if (prevIndex !== -1) {
            if (playerSeats[prevIndex + 1]) {
                return playerSeats[prevIndex + 1].seat
            } else {
                return playerSeats[0].seat;
            }
        } else {
            console.log('Error findNext Seat!', prevSeat)
            return 0;
        }
    }

    this.findBeforeSeat = (playerList, prevSeat) => {
        const prevIndex = playerList.findIndex(x => x.seat === prevSeat);
        if (prevIndex !== -1) {
            if (playerSeats[prevIndex - 1]) {
                return playerSeats[prevIndex - 1].seat
            } else {
                return playerSeats[0].seat;
            }
        } else {
            console.log('Error findNext Seat!', prevSeat)
            return 0;
        }
    }


    this.getPlayersInStage = (stageNo) => {
        const foundPlayers = this.players.filter(x => x.inGame === true && x.stageNumber === stageNo);
        return foundPlayers;
    }

    this.getPlayersInStageNotFold = (stageNo) => {
        const foundPlayers = this.players.filter(x => x.inGame === true && x.stageNumber === stageNo);
        return foundPlayers;
    }

    this.assignBlinds = () => {
        const flopBets = [];
        this.smallBlindSlot = this.findNextSeat(this.playerList, this.roundDealer);
        this.bigBlindSlot = this.findNextSeat(this.playerList, this.smallBlindSlot);
        this.currentRoundLastPlayerSlot = this.bigBlindSlot;
        this.currentActivePlayerSlot = this.findNextSeat(this.playerList, this.bigBlindSlot);

        for (p of this.players) {
            p.inGame = true;
            p.playerStage = 1;
            if (p.seat === this.bigBlindSlot) { p.bigBlind = true }
            if (p.seat === this.smallBlindSlot) { p.smallBind = true }
            if (p.playedRounds === 0 && p.seat != this.smallBlindSlot) { p.bigBlind = true }
            if (p.bigBlind) {
                let bigAmount;
                if (this.bigBlind > p.money) { p.allIn = true; bigAmount = p.money } else { bigAmount = this.bigBlind }
                flopBets.push({ player: p.getUsername(), betAmount: bigAmount, betType: 'bigBlind' })
            }
            if (p.smallBind) {
                let smallAmount;
                if (this.smallBind > p.money) { p.allIn = true; smallAmount = p.money } else { smallAmount = this.smallBlind }
                flopBets.push({ player: p.getUsername(), betAmount: smallAmount, betType: 'smallBlind' })
            }
        }
        this.roundBets.push({ stageNo: this.stageNumber, Bets: flopBets })
    }

    this.playerCMD = (player, Args) => {

        if (player.seat === this.currentActivePlayerSlot) {
            console.log('Receive Active Command', player.seat)
            player.status = 'Check';
            clearTimeout(this.timeoutData);
            this.nextPlayerMove()
        } else {
            console.log('Not Accept Command', player.seat)
        }

    }

    this.waitActFromPlayer = (playerSlot, stageNumber) => {
        console.log('Timeout Receive', playerSlot, stageNumber)
        if (playerSlot === this.currentActivePlayerSlot && stageNumber === this.stageNumber) {
            this.timeoutPlayer(playerSlot, stageNumber);
        }
    }

    this.timeoutPlayer = (playerSlot, stageNumber) => {
        const findPlayer = this.players.find(x => x.seat === playerSlot);
        console.log('TimeoutPlayer', playerSlot);
        if (findPlayer && stageNumber === this.stageNumber) {
            const stageHasBet = this.getStageBet(this.stageNumber)
            if (stageHasBet > 0) {
                findPlayer.status = 'Fold';
            } else {
                findPlayer.status = 'Check';
            }
            clearTimeout(this.timeoutData);
            this.playerUpdatePublish();
            this.nextPlayerMove();
        } else {
            console.log('Timeout Error player!')
        }
    }


    this.dealCards = () => {
        this.deck.shuffle();
        for (let pn = 0; pn < this.getNumPlayers(); pn++) {
            this.players[pn].cards = [];
            for (let i = 0; i < this.cardsPerPlayer; i++) {
                this.players[pn].addCard(this.deck.dealRandomCard());
            }
        }
        this.refreshCards();
    };

    this.refreshCards = function () {
        for (let pn = 0; pn < this.getNumPlayers(); pn++) {
            this.players[pn].cards.sort((a, b) => {
                return a.compare(b);
            });

            console.log('Giving Cards', this.getNumPlayers())
            this.players[pn].emit('dealt', {
                username: this.players[pn].getUsername(),
                cards: this.players[pn].cards,
            });
        }
    };


    this.setDealer = () => {
        this.gameNumber === 0 || this.roundDealer === 0 ? this.roundDealer = this.getFirstPlayerSeat() : this.roundDealer = this.findNextSeat(this.roundDealer);
        console.log('set Dealer', this.roundDealer);
    }

    this.getStageBet = (stageNo) => {
        const findStage = this.roundBets.find(x => x.stageNo === stageNo);
        if (findStage) {
            const totalBet = findStage.Bets.map(x => x.betAmount);
            const sumBet = _.sum(totalBet);
            return sumBet;
        } else {
            return 0;
        }
    }

    this.getFirstPlayerSeat = () => {
        const playerSeats = this.players.sort((a, b) => a.seat - b.seat);
        if (playerSeats[0].seat) {
            return playerSeats[0].seat
        } else {
            console.log('Error > Find First Player')
            return 0;
        }
    }

    this.getNonFoldSeats = () => {
        return this.players.filter(x => x.status !== 'Fold' && x.inGame === true).sort((a, b) => a.seat - b.seat).map(x => x.seat);
    }

    this.getNonFoldPlayers = () => {
        return this.players.filter(x => x.status !== 'Fold').sort((a, b) => a.seat - b.seat);
    }

    this.getNonFoldPlayersCount = () => {
        return this.players.filter(x => x.status !== 'Fold').length;
    }

    this.getInGamePlayers = () => {
        return this.players.filter(x => x.inGame === true).sort((a, b) => a.seat - b.seat);
    }

    this.getAllPlayers = () => {
        return this.players.sort((a, b) => a.seat - b.seat);
    }


    this.gameUpdatePublish = () => {
        io.to(this.gameName).emit('gameUpdate', {
            gameName: this.gameName,
            gameData: this.getGameData()
        });
    }

    this.playerUpdatePublish = () => {
        io.to(this.gameName).emit('playerUpdate', {
            gameName: this.gameName,
            playersData: this.getPlayerData(),
        });
    }


    this.getFullGameData = () => {
        return {
            gameName: this.gameName,
            gameData: this.getGameData(),
            playersData: this.getPlayerData()

        };
    }


    this.playerLeft = (player) => {
        this.disconnectedPlayers.push(player);
        if (player.getStatus() == 'Their Turn') {

        }
        this.players = this.players.filter((a) => a !== player);
        this.playerUpdatePublish();
    };

    this.addPlayer = (playerName, socket, seat) => {
        const player = new Player(playerName, socket, seat);
        this.players.push(player);
        this.playerUpdatePublish();
        this.gameStarter();
        return player;
    };




    this.getGameData = () => {
        let gameData = {
            maxPlayer: this.maxPlayer,
            gameName: this.gameName,
            gameStatus: this.gameStatus,
            dealer: this.roundDealer,
            bigBlindSlot: this.bigBlindSlot,
            smallBlindSlot: this.smallBlindSlot,
            stageNumber: this.stageNumber,
            currenPlay: this.currentActivePlayerSlot
        }

        return gameData;
    }


    this.getName = () => {
        return this.gameName;
    }

    this.findPlayerName = (playerName) => {
        const foundPlayer = this.players.find(x => x.getUsername() === playerName);
        return foundPlayer;
    };

    this.getPlayerData = () => {
        let playersData = [];
        for (let i = 1; i <= this.maxPlayer; i++) {
            let Seats = { seat: i }
            const findPlayer = this.players.find(x => x.seat === i);
            if (findPlayer) {
                const playerData = {
                    username: findPlayer.getUsername(),
                    seat: findPlayer.getSeat(),
                    status: findPlayer.status,
                    inGame: findPlayer.inGame,
                    smallBlind: findPlayer.smallBind,
                    bigBlind: findPlayer.bigBlind
                }
                Seats.playerInfo = playerData;
            }
            playersData.push(Seats)
        }
        return playersData;
    }

    this.findPlayerBySocketId = (socketId) => {
        for (let pn = 0; pn < this.getNumPlayers(); pn++) {
            if (this.players[pn].socket.id === socketId) {
                return this.players[pn];
            }
        }
        return { socket: { id: 0 } };
    };



    this.getNumPlayers = () => {
        return this.players.length;
    };

    this.resetGame = (startNew) => {
        this.gameStatus = "On-Wait";
        for (pn of this.players) {
            pn.status = '';
            pn.smallBlind = false;
            pn.bigBlind = false;
        }

        this.gameUpdatePublish();
        if (startNew) {
            this.gameStart();
        }

    }



}

module.exports = Game;