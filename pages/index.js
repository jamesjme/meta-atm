import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [notification, setNotification] = useState({ message: "", visible: false });

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      try {
        let tx = await atm.deposit(50); // Change deposit amount to 50 ETH
        await tx.wait();
        getBalance();
        showNotification("Deposit successful", true, "Deposit", 50);
      } catch (error) {
        console.error("Deposit error:", error);
        showNotification("Deposit failed", false, "Deposit", 50);
      }
    }
  };

  const withdraw = async () => {
    if (atm) {
      try {
        let tx = await atm.withdraw(30); // Change withdraw amount to 30 ETH
        await tx.wait();
        getBalance();
        showNotification("Withdrawal successful", true, "Withdrawal", 30);
      } catch (error) {
        console.error("Withdrawal error:", error);
        showNotification("Withdrawal failed", false, "Withdrawal", 30);
      }
    }
  };

  const showNotification = (message, success, type, amount) => {
    setNotification({ message, success, type, amount, visible: true });

    // Hide the notification after a few seconds
    setTimeout(() => {
      setNotification({ message: "", success: false, type: "", amount: 0, visible: false });
    }, 5000);
  };

  const initUser = () => {
    // Check to see if the user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    // Check to see if the user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Connect Metamask Wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    // Additional details including loans, fixed deposit, average monthly balance, father name, and mother name
    const additionalDetails = {
      accountHolderName: "John Doe",
      education: "Bachelor's Degree",
      creditScore: 750,
      loans: 1000,
      fixedDeposit: 2000,
      averageMonthlyBalance: 5000,
      fatherName: "John Doe Sr.",
      motherName: "Jane Doe",
    };

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <p>Account Holder Name: {additionalDetails.accountHolderName}</p>
        <p>Education: {additionalDetails.education}</p>
        <p>Credit Score: {additionalDetails.creditScore}</p>
        <p>Loans: {additionalDetails.loans} ETH</p>
        <p>Fixed Deposit: {additionalDetails.fixedDeposit} ETH</p>
        <p>Average Monthly Balance: {additionalDetails.averageMonthlyBalance} ETH</p>
        <p>Father Name: {additionalDetails.fatherName}</p>
        <p>Mother Name: {additionalDetails.motherName}</p>
        <button onClick={deposit}>Deposit 50 ETH</button>
        <button onClick={withdraw}>Withdraw 30 ETH</button>

        {/* Notification */}
        {notification.visible && (
          <div className={`notification ${notification.success ? 'success' : 'error'}`}>
            {notification.message} {notification.type && `(${notification.type} ${notification.amount} ETH)`}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header><h1>Welcome to the Metacrafters ATM!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background-color: #8B4513; /* Brown Background */
        }

        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 10px;
          border-radius: 5px;
          color: #fff;
          font-weight: bold;
        }

        .success {
          background-color: #4CAF50;
        }

        .error {
          background-color: #f44336;
        }
      `}
      </style>
    </main>
  );
}
