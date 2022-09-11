import React, { useContext, useEffect, useState, useRef } from "react";
import { SocketContext } from '../../lib/SocketClient';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core'
import logo from '../../assets/logo.svg';
import { InjectedConnector } from "@web3-react/injected-connector";
import { toast } from 'react-toastify';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import { Link } from "react-router-dom";
import { TbCopy } from 'react-icons/tb';
import './Header.scss';
import metaMaskIcon from '../../assets/metamask.svg'


export default function Header() {
    const [dateState, setDateState] = useState(new Date());

    const Injected = new InjectedConnector({ supportedChainIds: [1, 3, 56] });

    useEffect(() => {
        library?.getBalance(account).then((result) => { setBalance((result / 1e18).toFixed(4)) })
    });

    useEffect(() => {

        const Pw = localStorage.getItem('Pw');
        if(Pw) {
            activateMetamask();
        }
        setInterval(() => setDateState(new Date()), 30000);



    }, []);

    const { activate, deactivate, active, chainId, account, library, provider, pwCode } = useWeb3React();
    const socket = useContext(SocketContext);
    const [balance, setBalance] = useState("")


    function accountAddress() {
        const First = account.slice(0, 5);
        const Last = account.slice(-4);
        const bind = First + '...' + Last;
        return bind;
    }

    function activateMetamask() {
        activate(Injected, err => {

            toast.error(err.toString(), {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

        });
    }

    return (

        <Container className="headerContainer">
            <Row className="pt-3 justify-content-between">
                <Col className="" xs="12" sm="12" md="12" lg="2" xl="2">
                    <div className="Logo w-100 text-center">
                        <div className="appLogoText">  <Link to="/"><img src={logo} className="appLogo" height="48" width="48" /> PokerRoom </Link></div>
                    </div>
                </Col>
                <Col xs="12" sm="12" md="12" lg="5" xl="5" className="d-none d-lg-block"></Col>

                <Col xs="12" sm="12" md="12" lg="5" xl="5" align="end" className="float-end">

                    {account && <div className="loggedIn px-2 float-md-end float-lg-end mx-auto justify-content-center">
                        <div className="balanceDiv">
                            <div className="mainBalance"> {balance} BNB </div>
                            <div className="tokenBalance"> 0 SKC </div>
                        </div>
                        <div className="walletInfo">
                            <Button variant="walletInfo">{accountAddress()}&nbsp;<TbCopy /></Button>
                        </div>
                        <div className="walletLogo">
                            <Button variant="walletLogo" onClick={() => { deactivate() }}><Jazzicon className="avatarWallet" diameter={24} seed={jsNumberForAddress(account)} /></Button>
                        </div>
                    </div>
                    }
                    {!account &&
                        <div className="notLogged text-xs-end text-sm-end text-md-end text-lg-end">
                            <Button variant="main" onClick={() => { activateMetamask() }}> Connect Metamask  <img src={metaMaskIcon} className="metaIcon" height="24" width="24"></img> </Button>
                        </div>

                    }
                    <div style={{clear:'both'}}>
                    <span  className="dateTime">{dateState.toLocaleString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true,
                    })}
                    
                    {pwCode}
                    </span></div>

                </Col>
            </Row>
        </Container>
    )

}