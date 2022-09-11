import './GameTable.scss'
import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from '../../lib/SocketClient';
import { useWeb3React } from '@web3-react/core'
import { Stage, Layer, Star, Text, Image, Rect, Circle, Line, Konva, Group, Shape } from 'react-konva';
import useImage from "use-image";
import medal from '../../assets/medallion.png'
import cardBack from '../../assets/cardBack.png'
import sitBtn from '../../assets/sitBtn.png'
import tableBg from '../../assets/tableBg.jpg'
import { Button } from 'react-bootstrap';
import dealer from '../../assets/dealer.png'
import _ from "lodash";
import { TbPlayerStop } from 'react-icons/tb';
import { useLocation, useNavigate } from 'react-router-dom';



export default function GameTable(Prop) {

    const [size, setSize] = React.useState({ width: 752, height: 487 });
    const { activate, deactivate, active, chainId, account, library, provider } = useWeb3React();
    const socket = useContext(SocketContext);
    const [gameName, setGameName] = useState();
    const location = useLocation();
    const navigate = useNavigate();


    useEffect(() => {
        console.log('Page Load');
        loadGameData();
        socket.on('RoomUpdate', Data => {
           console.log('Room Update')
        });
        socket.on('playerUpdate', async cb => {
            console.log('playerUpdate')
        });

        socket.on('gameStart', Data => {
           console.log('gameStart');
        });

        socket.on('rerender', Data => {
            console.log('Rending Data', Data)
        });
        return () => {
            console.log('Game Closed');
            socket.off('RoomUpdate');
            socket.off('gameStart');
            socket.off('playerUpdate')
            socket.off('rerender');
            socket.off('gameStart');
        };
    }, []);



    useEffect(() => {
    
        console.log('set gameName')
    }, [gameName]);


    function loadGameData() {
        socket.emit('joinRoom', { gameName: location.state.gameName }, cb => {
            setGameName(cb.gameData.gameName);
        });
    }

    function sitTable(Slot) {
        const Pw = localStorage.getItem('Pw');
        socket.emit('sitTable', { gameName: gameName, playerName: account, seat: Slot, Pw }, async cb => {
            console.log('cb done')
            setGameName('cb.gameData.gameNamer');

        });
    }

    function reset() {
        socket.emit('test', { gameName: gameName }, x => {
            console.log('test Send');
        });
    }

    function leave() {
    
            console.log('Send Leave Table');
            socket.emit('leaveTable', { gameName: gameName });
      
    }



    return (
        <div className="Game">

{gameName}
<p></p>

            <Button onClick={e => loadGameData()}> loadgameData </Button> &nbsp;

            <p></p>
            <Button onClick={e => sitTable(1)}> sitTable</Button>&nbsp;
            <Button onClick={e => leave()}> leaveTable</Button>


            <p></p>
            <Button onClick={e => reset(1)}> reset</Button>&nbsp;
        </div>
    )
}
