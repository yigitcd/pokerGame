import React from "react";
import Spinner from 'react-bootstrap/Spinner';

export default function Airdrop() {

    return (
      <div className="loadingPage">
      <Spinner className="loadBar" animation="border" size="xl" variant="light" style={{ width: "4rem", height: "4rem" }}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
    );
  
}
