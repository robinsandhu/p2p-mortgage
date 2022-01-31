import React, { useState, useEffect } from "react";
import getWeb3 from "./getWeb3";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Lend from "./pages/Lend"
import Borrow from "./pages/Borrow"
import Home from "./pages/Home"
import Navbar from "./components/Navbar"
import BankContract from "./contracts/Bank.json"
import MortgageContract from "./contracts/Mortgage.json"
import AssetContract from "./contracts/Asset.json"
import Footer from "./components/Footer"
import Verify from "./pages/Verify";
import Nft from "./pages/Nft";

function App() {
  const [ web3, setWeb3 ] = useState(null)
  const [ walletAvailable, setWalletAvailable ] = useState(true)
  const [ account, setAccount ] = useState(null)
  const [ bankContract, setBankContract ] = useState(null)
  const [ mortgageContract, setMortgageContract ] = useState(null)
  const [ assetContract, setAssetContract ] = useState(null)
  const [ bankContractAddress, setBankContractAddress ] = useState(null)
  const [ assetContractAddress, setAssetContractAddress ] = useState(null)

  useEffect(() => {
    async function init() {
      try {
        // Get network provider and web3 instance.
        const web3Instance = await getWeb3();

        // Use web3 to get the user's accounts.
        const accountsList = await web3Instance.eth.getAccounts();

        // Get the contract instance.
        const networkId = await web3Instance.eth.net.getId();

        const bankContractDeployedNetwork = BankContract.networks[networkId];
        const bankContractInstance = new web3Instance.eth.Contract(
          BankContract.abi,
          bankContractDeployedNetwork && bankContractDeployedNetwork.address,
        );
        const mortgageContractDeployedNetwork = MortgageContract.networks[networkId];
        const mortgageContractInstance = new web3Instance.eth.Contract(
          MortgageContract.abi,
          mortgageContractDeployedNetwork && mortgageContractDeployedNetwork.address,
        );
        const assetContractDeployedNetwork = AssetContract.networks[networkId];
        const assetContractInstance = new web3Instance.eth.Contract(
          AssetContract.abi,
          assetContractDeployedNetwork && assetContractDeployedNetwork.address,
        );

        const bankContractOwner = await bankContractInstance.methods.owner().call()
        const aca = await bankContractInstance.methods.getAssetContractAddress().call()
        console.log(bankContractOwner, aca)
        if(accountsList[0] === bankContractOwner && aca === "0x0000000000000000000000000000000000000000")
          bankContractInstance.methods.setAssetContract(assetContractDeployedNetwork.address).send({from: accountsList[0]})
        setBankContractAddress(bankContractDeployedNetwork.address)
        setAssetContractAddress(assetContractDeployedNetwork.address)
        setWeb3(web3Instance)
        setAccount(accountsList[0])
        setBankContract(bankContractInstance)
        setMortgageContract(mortgageContractInstance)
        setAssetContract(assetContractInstance)

      } catch (error) {
        // Catch any errors for any of the above operations.
        setWalletAvailable(false)
        console.error(error);
      }
    }

    init()
  }, [])

  return (
    <React.Fragment>
        {web3 ? 
        <Router>
          <Routes>
            <Route path="/" element={
              <React.Fragment>
                <Navbar />
                  <div className="container">
                    <Home />
                  </div>
                <Footer />
              </React.Fragment>
            }
            />
            <Route path="/lend" element={
              <React.Fragment>
                <Navbar />
                  <div className="container">
                    <Lend web3={web3} account={account} bankContract={bankContract} assetContract={assetContract} mortgageContract={mortgageContract} />
                  </div>
                <Footer />
              </React.Fragment>
            }  
            />
            <Route path="/borrow" element={
              <React.Fragment>
                <Navbar />
                  <div className="container">
                    <Borrow web3={web3} assetContractAddress={assetContractAddress} bankContractAddress={bankContractAddress} account={account} bankContract={bankContract} assetContract={assetContract} mortgageContract={mortgageContract} />
                  </div>
                <Footer />
              </React.Fragment>
            } 
            />
            <Route path="/nft" element={<Nft web3={web3} account={account} assetContract={assetContract} />} />
            <Route path="/verify" element={<Verify />} />
          </Routes>
        </Router>
        : 
        !walletAvailable ?
        <div style={{textAlign: "center"}}>
          <h3>Please Install <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer" >Metamask</a></h3>
          <img src="/metamask1.png" width=""></img>
        </div>
        :
        <div style={{textAlign: "center"}}>
          <h3>Loading Web3, accounts, and contract...</h3>
        </div>
        }
    </React.Fragment>
  );
}

export default App;
