import logo from './logo.svg';
import './App.scss';
import { useEffect, useState } from 'react'
import { socket } from './lib/SocketClient.js';
import Header from './components/Header'
import { useWeb3React } from '@web3-react/core'
import Home from './pages/Home'
import GameTable from './pages/GameTableNew'
import { BrowserRouter, Routes, Route, } from "react-router-dom";
import LoadingSpinner, { checkSpin } from './components/LoadingSpinner';
import { ToastContainer, toast } from 'react-toastify';

function App() {


  const globalVar = { coinName: "SİKCO" };
  const { activate, deactivate, active, chainId, account, library, provider } = useWeb3React();
  const [pageLoading, setPageLoad] = useState(true);


  useEffect(x => {
    socket.on('connect', x => {
      console.log('Connected');
      setPageLoad(false)
    });

    socket.on('disconnect', x => {
      setPageLoad(true)
    });

  }, [])


  return (
    <BrowserRouter>
      {pageLoading ? <LoadingSpinner /> :
        <div className="App">
          <Header />
          <Routes>
            <Route path="/" element={<Home />}>
              <Route index element={<Home />} />
            </Route>
            <Route path="/gameTable" element={<GameTable />}/>
          </Routes>
        </div >
      }
     <ToastContainer position={toast.POSITION.BOTTOM_RIGHT} autoClose={2000}/>
    </BrowserRouter>

  );
}

export default App;
