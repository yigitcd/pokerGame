import './Home.scss'
import React, { useContext, useEffect, useState } from "react";
import { Container } from 'react-bootstrap';
import { SocketContext } from '../../lib/SocketClient';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useWeb3React } from '@web3-react/core'
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { useNavigate } from "react-router-dom";


export default function Home() {


    const [potRange, setRange] = useState(50);
    const { activate, deactivate, active, chainId, account, library, provider } = useWeb3React();
    const socket = useContext(SocketContext);
    const navigate = useNavigate();

    function JoinRoom(potRange, Acc, Pw) {
        socket.emit('getTable', { potLimit: potRange }, cb => {     
            if(cb.gameName) {
              navigate('/gameTable', { state:{ gameName: cb.gameName }});  
            }  else {
                console.log('Error On getTable')
            }
           
        })
    }
    async function signLogin() {
        const Pw = localStorage.getItem('Pw');
        if (account) {
            if (Pw !== null) {
                let verified = await ethers.utils.verifyMessage("PokerLogin", Pw);
                if (verified === account) {
                    JoinRoom(potRange, account, Pw)
                } else {
                    getLogged();
                }
            } else {
                getLogged();
            }
        }
        else {
            toast.error("Metamask Not Connected.");
        }
    }

    async function getLogged() {
        library.getSigner().signMessage('PokerLogin').then(x => {
            localStorage.setItem('Pw', x);
            JoinRoom(potRange, account, x)
        }).catch(e => {
            toast.error("You should Sign to Enter Room!");
        });
    }


    return (
        <div>
            <Container className="HomeMain">
                <Form >
                    <Form.Label>Pot Limit {potRange}</Form.Label>
                    <Form.Range onChange={e => { setRange(e.target.value) }} min={50} max={5000} step={250} value={potRange} />
                    <Button onClick={signLogin}> Joins </Button>
                </Form>
            </Container >


        </div>
    )
}