import React from 'react';
import io from 'socket.io-client';


const connectionConfig = {
    reconnection: true,
    reconnectionDelay: 100,
    reconnectionAttempts: 100000,
    forceNew: false,
    transports: ['websocket'],
    query: "cType=Poker" 
   };

export const socket = io.connect("http://91.92.144.45:8080", connectionConfig);
export const SocketContext = React.createContext();