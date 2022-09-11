// server-side game logic for a texas hold 'em game
const Deck = require('./Deck.js');
const Player = require('./Player.js');
const _ = require('lodash');
const Hand = require('pokersolver').Hand;

const Game = function (io, name, blind) {
    this.deck = new Deck();
    this.players = [];
    this.gameName = name;
    this.timeoutData;
    this.smallBlind = blind;
    this.bigBlind = this.smallBlind * 2;
    this.timeoutTime = 10000;
    this.stageNumber = 0;
    this.stageBets = [];
    this.gameNumber = 0;
    this.maxPlayer = 5;
    this.cardsPerPlayer = 2;
    this.gameStatus = "On-Wait";
    const constructor = (function () { })(this);


    this.gameStarter = (admin) => {
        if(getNumPlayers() === 1) { this.gameStatus === "On-Wait" }
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
        return;
    };

    this.gameStart = () => {
        this.stageBets = [];
        this.setDealer();
        this.assignBlinds();
    }


    this.assignBlinds = () => {
        const flopBets = [];
        this.smallBlindSlot = this.findNextSeat(this.playerList, this.roundDealer);
        this.bigBlindSlot = this.findNextSeat(this.playerList, this.smallBlindSlot);
        this.lastPlayer = this.bigBlindSlot;
        this.activePlayer = this.findNextSeat(this.playerList, this.bigBlindSlot);
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

    this.setDealer = () => {
        this.gameNumber === 0 || this.roundDealer === 0 ? this.roundDealer = this.getFirstPlayerSeat() : this.roundDealer = this.findNextSeat(this.roundDealer);
        console.log('set Dealer', this.roundDealer);
    }

    
    this.findNextSeat = (prevSeat) => {
        
       
    }

  
    this.getFirstPlayer = () => {
        const playerSeats = this.players.sort((a, b) => a.seat - b.seat);
        return playerSeats[0] ? playerSeats[0].seat : 0;
    }

    this.addPlayer = (playerName, socket, seat) => {
        const player = new Player(playerName, socket, seat);
        this.players.push(player);
        this.gameStarter();    
        return;
    };

    
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
                    playerStage: findPlayer.playerStage,
                    curBet : findPlayer.curBet
                }
                Seats.playerInfo = playerData;
            }
            playersData.push(Seats)
        }
        return playersData;
    }




}