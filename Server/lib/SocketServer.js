const Game = require('../newLib/GameOld.js');
const { v4: uuidv4 } = require('uuid');
const { LEGAL_TLS_SOCKET_OPTIONS } = require('mongodb');
let Rooms = [];







class Connection {
    constructor(io, socket) {
        this.socket = socket;
        this.io = io;
        console.log("Website Connect", socket.id);



        socket.on('getTable', async (Args, cb) => {
            try {
                let game;
                let RoomFound = Rooms.filter((r) => r.smallBlind === Number(Args.potLimit));
                if (RoomFound.length === 0) {
                    console.log('New Table Created');
                    game = new Game(io, uuidv4(), Number(Args.potLimit));
                    Rooms.push(game);
                } else {
                    game = Rooms.find((r) => r.getName() === RoomFound[0].gameName);
                }
                cb({ gameName: game.getName() });
            } catch (e) {
                console.log('Error Catch: Error On GetTable', e);
            }
        })

        socket.on('joinRoom', async (Args, cb) => {
            let RoomFound = Rooms.find((r) => r.gameName === Args.gameName);
            if (RoomFound) {
                socket.join(RoomFound.getName()); cb(RoomFound.getFullGameData());
            } else {
                cb({ Error: true, ErrTx: "Game Not Found" });
            }
        });


        socket.on('test', async (Args, cb) => {
            try {
                let tableFound = Rooms.find((r) => r.getName() === Args.gameName);
                if (tableFound) {
                    console.log('Reset Table');
                    tableFound.resetGame(true);
                }
            } catch (e) {
                console.log('Error Catch: Test', e);
            }
        });



        socket.on('playerCMD', async (Args) => {
            const game = Rooms.find(
                (r) => r.findPlayerBySocketId(socket.id).socket.id === socket.id
            );
            if (game != undefined) {
                const player = game.findPlayerBySocketId(socket.id);
                console.log('Player CMD', player.getUsername());
                game.playerCMD(player, Args)
            } else {
                console.log('Player Not On Table');
            }
        });




        socket.on('sitTable', async (Args, cb) => {
            let tableFound = Rooms.find((r) => r.getName() === Args.gameName);

            if (Args.playerName && Args.Pw) {
                if (tableFound) {
                    if (!tableFound.findPlayerName(Args.playerName)) {
                        const addPlayer = tableFound.addPlayer(Args.playerName, socket, Args.seat);
                        cb({ Success: true, Seat: addPlayer.seat });
                    } else {
                        cb({ Error: true, ErrTx: "You are Already in Table" });
                    }
                } else {
                    console.log('Game Not Found', Rooms);
                    cb({ Error: true, ErrTx: "Game Not Found" })
                }
            } else {
                cb({ Error: true, ErrTx: "You Arent Logged" })
            }
        });


        socket.on('leaveRoom', async (Args, cb) => {
            let RoomFound = Rooms.find((r) => r.gameName === Args.gameName);
            if (RoomFound) {
                socket.leave(RoomFound.getGameData());
            } else {
                console.log('Leave Room Fail Game Not Found');
            }
        });




        socket.on('leaveTable', async (Args, cb) => {
            const game = Rooms.find(
                (r) => r.findPlayerBySocketId(socket.id).socket.id === socket.id
            );
            if (game != undefined) {
                const player = game.findPlayerBySocketId(socket.id);
                game.playerLeft(player);
                console.log('Player Leave From Table', player.getUsername());
            } else {
                console.log('Player Not On Table');
            }
        });






        socket.on('disconnect', async () => {
            const game = Rooms.find((r) => r.findPlayerBySocketId(socket.id).socket.id === socket.id);
            if (game != undefined) {
                const player = game.findPlayerBySocketId(socket.id);
                game.playerLeft(player);
            }
        })



        socket.on('connect_error', (err) => {
            console.log(`Website connect_error due to ${err.message}`);
        });
    }
}

function SocketServer(io) {
    io.on('connection', async (socket) => {

        console.log('New Connect');
        new Connection(io, socket);

        socket.on('disconnect', async () => {

            console.log('Socket Disconnect');
        });
    });
}


module.exports = SocketServer;