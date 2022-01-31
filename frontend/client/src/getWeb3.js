import Web3 from "web3";

const getWeb3Helper = async (resolve, reject) => {
  // Modern dapp browsers...
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    try {
      // Request account access if needed
      await window.ethereum.enable();
      // Accounts now exposed
      resolve(web3);
    } catch (error) {
      reject(error);
    }
  }
  // Legacy dapp browsers...
  else if (window.web3) {
    // Use Mist/MetaMask's provider.
    const web3 = window.web3;
    console.log("Injected web3 detected.");
    resolve(web3);
  }
  else {
    reject("No web3 instance found! Please install a wallet")
  }
};

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    getWeb3Helper(resolve, reject)

  });

export default getWeb3;
