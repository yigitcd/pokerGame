const Player = function (playerName, socket, seat) {
    this.username = playerName;
    this.cards = [];
    this.socket = socket;
    this.money = 100;
    this.seat = seat;
    this.playerStage = 0;
    this.smallBlind = false;
    this.bigBlind = false;
    this.curBet = 0;
    this.status = 'new';
    this.playedRounds = 0;
    this.timeoutCount = 0;
    this.allIn = false;

    this.addCard = (card) => {
        this.cards.push(card);
    };

    this.getUsername = () => {
        return this.username;
    };

    this.getSeat = () => {
        return this.seat;
    };

    this.setSeat = (s) => {
        this.seat = s;
    };

    this.getStatus = () => {
        return this.status;
    };

    this.setStatus = (val) => {
        this.status = val;
    };

    this.emit = (eventName, payload) => {
        this.socket.emit(eventName, payload);
    };
};

module.exports = Player;