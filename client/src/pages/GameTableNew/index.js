import './GameTable.scss'
import React, { useContext, useEffect, useState } from "react";
import { SocketContext } from '../../lib/SocketClient';
import { useWeb3React } from '@web3-react/core'
import { Stage, Layer, Star, Text, Image, Rect, Circle, Line, Group, Shape } from 'react-konva';
import Konva from 'konva';
import useImage from "use-image";
import medal from '../../assets/medallion.png'
import cardBack from '../../assets/cardBack.png'
import tableBg from '../../assets/tableBg.jpg'
import { Button } from 'react-bootstrap';
import stnBtn from '../../assets/sitBtn.png'
import dealer from '../../assets/dealer.png'
import cardFront from '../../assets/cardFront.png'
import suitHeart from '../../assets/suitHeart.png'
import suitSpade from '../../assets/suitSpade.png'
import suitDiamond from '../../assets/suitDiamond.png'
import suitClub from '../../assets/suitClub.png'


import _ from "lodash";
import { useLocation, useNavigate } from 'react-router-dom';

export default function GameTableManager(Prop) {


    const [pageLoad, setPageLoad] = React.useState(false);
    const [gameData, setGameData] = useState({});
    const [playersData, setPlayersData] = useState({});
    const socket = useContext(SocketContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { activate, deactivate, active, chainId, account, library, provider } = useWeb3React();
    const [canvasSize, setCanvasSize] = React.useState({ width: 752, height: 487 });
    const [stnBtnImage] = useImage(stnBtn);
    const [medalImage] = useImage(medal);
    const [dealerImage] = useImage(dealer);
    const [cardFrontImage] = useImage(cardFront);
    const [backCardImage] = useImage(cardBack);
    const stageRef = React.useRef(null);
    const layerRef = React.useRef(null);
    const [mySeat, setMySeat] = useState();
    const [DealCard, setDealCard] = useState();
    const [dealt, setDealt] = useState();


    const [suitHeartImage] = useImage(suitHeart);
    const [suitDiamondImage] = useImage(suitDiamond);
    const [suitSpadeImage] = useImage(suitSpade);
    const [suitClubImage] = useImage(suitClub);



    const playerTemplate = [
        {
            name: "dealer",
            items: {}

        },
        {
            name: "player1",
            items: {
                mainFab: { size: { height: 200, width: 200 }, loc: { x: 80, y: 300 } },
                playerAvatar: { size: { height: 64, width: 64 }, loc: { x: 36, y: 36 } },
                playerMedal: { size: { height: 72, width: 72 }, loc: { x: 0, y: 0 } },
                userName: { size: { height: 24, width: 96 }, loc: { x: -12, y: 60 } },
                Card1: { size: { height: 35, width: 26 }, loc: { x: 50, y: -15 } },
                Card2: { size: { height: 35, width: 26 }, loc: { x: 58, y: -15 } },
                joinButton: { size: { height: 48, width: 48 }, loc: { x: 80, y: 330 } }
            }
        },
        {
            name: "player2",
            items: {
                mainFab: { size: { height: 200, width: 200 }, loc: { x: 80, y: 60 } },
                playerAvatar: { size: { height: 64, width: 64 }, loc: { x: 36, y: 36 } },
                playerMedal: { size: { height: 72, width: 72 }, loc: { x: 0, y: 0 } },
                userName: { size: { height: 24, width: 96 }, loc: { x: -12, y: 60 } },
                Card1: { size: { height: 35, width: 26 }, loc: { x: 50, y: -15 } },
                Card2: { size: { height: 35, width: 26 }, loc: { x: 58, y: -15 } },
                joinButton: { size: { height: 48, width: 48 }, loc: { x: 130, y: 50 } }
            }
        },
        {
            name: "player3",
            items: {
                mainFab: { size: { height: 200, width: 200 }, loc: { x: 600, y: 60 } },
                playerAvatar: { size: { height: 64, width: 64 }, loc: { x: 36, y: 36 } },
                playerMedal: { size: { height: 72, width: 72 }, loc: { x: 0, y: 0 } },
                userName: { size: { height: 24, width: 96 }, loc: { x: -12, y: 60 } },
                Card1: { size: { height: 35, width: 26 }, loc: { x: 50, y: -15 } },
                Card2: { size: { height: 35, width: 26 }, loc: { x: 58, y: -15 } },
                joinButton: { size: { height: 48, width: 48 }, loc: { x: 600, y: 50 } }
            }
        },
        {
            name: "player4",
            items: {
                mainFab: { size: { height: 200, width: 200 }, loc: { x: 650, y: 300 } },
                playerAvatar: { size: { height: 64, width: 64 }, loc: { x: 36, y: 36 } },
                playerMedal: { size: { height: 72, width: 72 }, loc: { x: 0, y: 0 } },
                userName: { size: { height: 24, width: 96 }, loc: { x: -12, y: 60 } },
                Card1: { size: { height: 35, width: 26 }, loc: { x: 0, y: -15 } },
                Card2: { size: { height: 35, width: 26 }, loc: { x: 8, y: -15 } },
                joinButton: { size: { height: 48, width: 48 }, loc: { x: 650, y: 330 } }
            }
        },
        {
            name: "player5",
            items: {
                mainFab: { size: { height: 200, width: 200 }, loc: { x: 350, y: 350 } },
                playerAvatar: { size: { height: 64, width: 64 }, loc: { x: 36, y: 36 } },
                playerMedal: { size: { height: 72, width: 72 }, loc: { x: 0, y: 0 } },
                userName: { size: { height: 24, width: 96 }, loc: { x: -12, y: 60 } },
                Card1: { size: { height: 35, width: 26 }, loc: { x: 50, y: -15 } },
                Card2: { size: { height: 35, width: 26 }, loc: { x: 58, y: -15 } },
                joinButton: { size: { height: 48, width: 48 }, loc: { x: 360, y: 360 } }
            }
        }
    ]



    useEffect(() => {

        socket.emit('joinRoom', { gameName: location.state.gameName }, async cb => {
            updateGameData(cb);
        });

        socket.on('gameUpdate', Data => {
            setGameData(Data.gameData);
        });

        socket.on('playerUpdate', async cb => {
            updatePlayerData(cb);
        });

        socket.on('gameStart', Data => {
            setDealCard(Data.players);
        });


        socket.on('dealt', Data => {
            setDealt(Data);
        });


        socket.on('rerender', Data => {
            console.log('Rending Data', Data)
        });

        return () => {
            console.log('Game Closed');
            leaveTable();
            socket.off('RoomUpdate');
            socket.off('gameStart');
            socket.off('playerUpdate')
            socket.off('rerender');
            socket.off('gameStart');
        };
    }, []);


    useEffect(() => {
        console.log('gameData', gameData)


        
    }, [gameData]);


    async function updateGameData(cb) {
        setPageLoad(true);
        if (cb.gameData) {
            console.log('Update Game Data', cb.gameData)
            setGameData(x => cb.gameData);
            setPlayersData(x => cb.playersData)
            console.log('Game Data Update', gameData);
        } else {
            navigate('/');
        }
    }

    async function updatePlayerData(cb) {
        if (cb.playersData) {
            setPlayersData(cb.playersData);
            console.log(playersData);
        }
    }


    function leaveTable(Slot) {
        socket.emit('leaveTable', { gameName: location.state.gameName });
        socket.emit('leaveRoom', { gameName: location.state.gameName });
        setMySeat(x => 0);
    }

    function shortUsername(username) {
        if (username) {
            const First = username.slice(0, 5);
            const Last = username.slice(-4);
            const bind = First + '...' + Last;
            return bind;
        } else {
            return '-'
        }

    }
    function sitTable(Slot) {
        const Pw = localStorage.getItem('Pw');
        socket.emit('sitTable', { gameName: gameData.gameName, playerName: account, seat: Slot, Pw }, async cb => {
            if (cb.Success) {
                console.log('Sit Success');
                setMySeat(cb.Seat);
            }
        });
    }

    function standUp() {
        console.log('Send Leave Table');
        socket.emit('leaveTable', { gameName: gameData.gameName });
    }

    function PlayerCMD() {
        console.log('Send CMD');
        socket.emit('playerCMD', { gameName: gameData.gameName });
    }



    function shufTest() {
        socket.emit('test', { gameName: gameData.gameName }, x => {
            console.log('test Send');
        });
        layerRef.current.clear();
    }
    async function shuffleCard(Players) {
        for (let j = 1; j <= 2; j++) {
            for (let i = 0; i < Players.length; i++) {
                const newCard = await NewCard(Players[i].seat, j, 0.2);
                if (newCard.owner === 'myHand') {

                    console.log('Change Card', newCard.cardSlot);
                    setDealt(x => {


                        if (x && x.cards) {


                            const drawC = drawCard(x.cards[newCard.cardSlot - 1].suit, x.cards[newCard.cardSlot - 1].value);
                            console.log('Dealt is', Players[i].seat)
                            newCard.pCard.visible(false);
                            drawC.position(playerTemplate[Players[i].seat].items.mainFab.loc)
                            layerRef.current.add(drawC);
                            

                        }

                        return x;
                    })


                }
            }
        }
    }

    function drawCard(cardT, cardN) {
        let fontColor, cardImg;
        if (cardT === "s" || cardT === "c") { fontColor = "#100C11" }
        if (cardT === "d" || cardT === "h") { fontColor = "#BE4B39" }
        if (cardT === 's') { cardImg = suitSpadeImage }
        if (cardT === 'd') { cardImg = suitDiamondImage }
        if (cardT === 'c') { cardImg = suitClubImage }
        if (cardT === 'h') { cardImg = suitHeartImage }
        var cardGroup = new Konva.Group({ height: 105, width: 78 });
        var cardFront = new Konva.Image({ height: 105, width: 78, image: cardFrontImage });
        var cardLogoSmall = new Konva.Image({ x: 6, y: 34, height: 22, width: 22, image: cardImg, align: "center" });
        var cardLogo = new Konva.Image({ x: 28, y: 45, height: 42, width: 42, image: cardImg });
        var cardText = new Konva.Text({ x: 10, y: 10, text: cardN, fontSize: 28, fill: fontColor, fontFamily: "Alfphabet", align: "center" });
        cardGroup.add(cardFront);
        cardGroup.add(cardLogo);
        cardGroup.add(cardLogoSmall);
        cardGroup.add(cardText);
        return cardGroup;
    }

    async function NewCard(slot, cardSlot, duration) {
        return new Promise(function (resolve) {
            var pCard = new Konva.Image({ x: 370, y: 100, height: 35, width: 28, image: backCardImage });
            layerRef.current.add(pCard);
            pCard.to({
                x: playerTemplate[slot].items.mainFab.loc.x + playerTemplate[slot].items['Card' + cardSlot].loc.x,
                y: playerTemplate[slot].items.mainFab.loc.y + playerTemplate[slot].items['Card' + cardSlot].loc.y,
                duration: duration,
                onFinish: () => {
                    if (mySeat === slot) {
                        openMyCard(slot, pCard, cardSlot);
                        resolve({ owner: 'myHand', cardSlot, pCard })
                    }
                    resolve({ owner: 'player' })
                },
            },
            );
        });
    };

    function openMyCard(slot, pCard, cardSlot) {
        //pCard.image(dealerImage);
        let rotation;
        if (cardSlot === 1) { rotation = 10 } else { rotation = 340 }
        pCard.to({
            height: 105,
            width: 72,
            duration: 0.5,
            onFinish: () => {
                pCard.to({
                    rotation: rotation
                })
            },
        });


    }

    return (
        pageLoad && <div className="Game">

            {account} my Seat : {mySeat}
            <Button onClick={e => sitTable(1)}> Sit Table </Button>
            <Button onClick={standUp}> Leave Table </Button>
            <Button onClick={shufTest}>Reset </Button>

            <p></p>

            <Button onClick={PlayerCMD}> CALL </Button>



            <Stage className="GameTable" size={canvasSize}>
                <Layer>
                    {gameData.gameStatus === 'On-Wait' && <Text text={"Oyuncular Bekleniyor"} fill="white" height={200} width={200} x={250} y={250} align="center" fontSize={30} />}
                    {gameData.gameStatus === 'On-Start' && <Text text="Game Starting!" fill="white" height={200} width={200} x={250} y={250} align="center" />}
                    {gameData.gameStatus === 'Game-Started' && <Text text="Game Started!" fill="white" height={200} width={200} x={250} y={250} align="center" />}
                    {playersData.map(xt =>
                        xt.playerInfo != undefined ?
                            (<Group key={"Player" + xt.seat} x={playerTemplate[xt.seat].items.mainFab.loc.x} y={playerTemplate[xt.seat].items.mainFab.loc.y}>
                                <Image image={medalImage} key={"Medal-" + xt.seat} size={playerTemplate[xt.seat].items.playerMedal.size} position={playerTemplate[xt.seat].items.playerMedal.loc} />
                                <Circle key={"Avatar-" + xt.seat} fill="red" size={playerTemplate[xt.seat].items.playerAvatar.size} position={playerTemplate[xt.seat].items.playerAvatar.loc} />
                                <Rect key={"userName-" + xt.seat} fill="black" size={playerTemplate[xt.seat].items.userName.size} position={playerTemplate[xt.seat].items.userName.loc} opacity={0.6} />
                                <Text text={shortUsername(xt.playerInfo.username)} fill="white" size={playerTemplate[xt.seat].items.userName.size} x={playerTemplate[xt.seat].items.userName.loc.x} y={playerTemplate[xt.seat].items.userName.loc.y + 5} align="center" />
                                {/* <Image image={backCardImage} size={playerTemplate[xt.seat].items.Card1.size} x={playerTemplate[xt.seat].items.Card1.loc.x} y={playerTemplate[xt.seat].items.Card1.loc.y} />
                                <Image image={backCardImage} size={playerTemplate[xt.seat].items.Card2.size} x={playerTemplate[xt.seat].items.Card2.loc.x} y={playerTemplate[xt.seat].items.Card2.loc.y} /> */}


                            </Group>) :
                            (<Image image={stnBtnImage} key={"SignBtn-" + xt.seat} size={playerTemplate[xt.seat].items.joinButton.size} position={playerTemplate[xt.seat].items.joinButton.loc} onClick={e => sitTable(xt.seat)} />)
                    )
                    }
                    <Image image={backCardImage} height={35} width={28} x={365} y={95} />
                    <Image image={backCardImage} height={35} width={28} x={370} y={100} />
                    <Image key="dealerImage" image={dealerImage} y={0} x={340} height={113} width={90} />
                    <Image ref={stageRef} image={backCardImage} height={35} width={28} x={370} y={100} onClick={e => shuffleCard(playersData)} />
                </Layer>

                <Layer ref={layerRef}>

                </Layer>


            </Stage>

        </div>
    )
}
