const express = require('express');
const session = require('express-session');
const mongoose = require("mongoose");


mongoose.connect("mongodb://localhost:27017/pokerdb", { useNewUrlParser: true })
    .then(async () => {
        const app = express();
        const server = require('http').createServer(app);

        const io = require('socket.io')(server,{
            maxHttpBufferSize: 1e8
          });
        const SocketServer = require('./lib/SocketServer');

        const sessionMiddleware = session({ secret: 'pokerGame', cookie: { maxAge: 3600000 } });
        app.use(sessionMiddleware);
        io.use((socket, next) => {
            sessionMiddleware(socket.request, {}, next);
            // sessionMiddleware(socket.request, socket.request.res, next); will not work with websocket-only
            // connections, as 'socket.request.res' will be undefined in that case
        });

        console.log('Started');
        SocketServer(io);
        const port = 8080;
        server.listen(port, () => console.log('server listening on port ' + port));

        app.get('/', function (req, res) {
            res.sendFile('./view/index.html', { root: __dirname });
        });

    });