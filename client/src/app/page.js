"use client"
import React, { useEffect, useRef, useState } from 'react'
import { providers, Contract, utils } from 'ethers'
import styles from './page.module.css'
import { NFT_CONTRACT_ADDRESS, abi } from './constants'
import Web3Modal from "web3modal";


export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [presaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerAddr, setOwnerAddr] = useState("");
  const [tokeIdsMinted, setTokenIdsMinted] = useState(0);

  // create an instance to web3 model (to connect metamask)
  const web3ModalRef = useRef();



  // --------PRESALE MINT----------
  const presaleMint = async () => {
    try {
      const signer = await getPrviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      // get contract function parsaleMint and give the value
      const presaleMint = await nftContract.parsaleMint({
        value: utils.parseEther("0.0001"),
      });
      setLoading(true);
      await parsaleMint.wait();
      setLoading(false);
      window.alert("You successfully minted a Crypto Dev");

    } catch (error) {
      console.log(error);
    }
  }


  // ---------------PUBLIC MINT--------
  const publicMint = async () => {
    try {
      const signer = await getPrviderOrSigner(true);
      const nftToken = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const _publicMint = await nftToken.mint({
        value: utils.parseEther("0.0001"),
      });
      setLoading(true);
      await _publicMint.wait();
      setLoading(false);
      window.alert("You successfully minted a Crypto Dev");
    } catch (error) {
      console.log(error);
    }
  }

  // ---------SATART PARSALE-----------------
  const startParsale = async () => {
    try {
      // get signer 
      const signer = await getPrviderOrSigner(true);
      // get contract 
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

      // Get contract function "startPresale"
      const startP = await nftContract.startPresale();
      setLoading(true);

      await startP.wait();
      setLoading(false);

      // set parsale started to true
      await checkIfPresaleStarted();


    } catch (error) {
      console.log(error);
    }
  }



  //-----------CHECK IF PARSALE STARTED-----------
  const checkIfPresaleStarted = async () => {
    try {
      // As this is get function so we need only provider
      const provider = await getPrviderOrSigner();

      // get contract 
      const cryptoContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

      // Call Smart Contract function ParsaleStarted
      const parsaleStarted = await cryptoContract.presaleStarted();
      if (!parsaleStarted) {
        getOwner();
      }
      setPresaleStarted(parsaleStarted);
      return parsaleStarted;
    } catch (error) {
      console.log(error)
    }
  }

  // ------------CHECK IF PARSALE ENDED------------
  const checkIfPresaleEnded = async () => {
    try {
      // get provider
      const provider = await getPrviderOrSigner()
      const cryptoContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);

      // Call parsaleEnded from smart Contract
      const presaleEnded = await cryptoContract.presaleEnded();
      // Date.now()/1000 returns the current time in seconds
      const hasEnded = presaleEnded.lt(Math.floor(Date.now() / 1000));
      if (hasEnded) {
        setPresaleEnded(true)
      } else {
        setPresaleEnded(false);
      }
      return hasEnded;

    } catch (error) {
      console.log(error);
    }
  }

  // -------GET OWNER-----
  const getOwner = async () => {
    try {
      // get provider
      const provider = await getPrviderOrSigner();
      // get contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // get owner function
      const _owner = await nftContract.owner();
      setOwnerAddr(_owner);
      // Get signer to get address of current user connected to metamask
      const signer = await getPrviderOrSigner(true);
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (error) {
      console.log(error)
    }
  }


  //----------GET TOKEN ID MINTED-------------
  const getTokenIdMinted = async () => {
    try {
      const provider = await getPrviderOrSigner();
      // get contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // get contract function
      const _numbOfTIds = await nftContract.tokenIds();
      setTokenIdsMinted(_numbOfTIds.toString());
    } catch (error) {
      console.log(error)
    }
  }

  // -------GET PROVIDER OR OWNER------
  const getPrviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect(true);
    const web3Provider = new providers.Web3Provider(provider);

    // If user is not connected to the BCB network, let them know and throw an error
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 97) {
      window.alert("Change the network to BCB");
      throw new Error("Change network to BCB");
    }


    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer
    }
    return web3Provider;
  }


  // -----------CONNECT WALLET-------------

  const connectWallet = async () => {
    try {
      await getPrviderOrSigner();
      setWalletConnected(true);
      console.log(getOwner())
    } catch (error) {
      console.log(error);
    }
  }


  // -----------------------USE EFFECT------------
  useEffect(() => {
    console.log(ownerAddr);

    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: 'Goerli',
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }

    //  check if parsale started and ended
    const _checkParsaleStarted = checkIfPresaleStarted();
    if (_checkParsaleStarted) {
      checkIfPresaleStarted();
    }

    getTokenIdMinted();


    //Set an interval which gets called every 5 seconds to check presale has ended
    const parsaleEndedInterval = setInterval((async () => {
      const presaleStarted = await checkIfPresaleStarted();
      if (presaleStarted) {
        const presaleEnded = await checkIfPresaleEnded();
        if (presaleEnded) {
          clearInterval(parsaleEndedInterval);
        }
      }
    }), 5 * 1000);

    // set an interval to get the number of token Ids minted every 5 second
    setInterval(async () => {
      await getTokenIdMinted();
    }, 5 * 1000);

  }, [walletConnected]);


  // Render Button based on the state
  const renderButton = () => {
    // If wallet not connected
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      )
    }
    // If loading
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }
  }

  // if connected user is owner and parsale hasn't started yet
  if (isOwner && !presaleStarted) {
    return (
      <button className={styles.button} onClick={startParsale}>
        Start Presale!
      </button>
    )
  }

  // If connected user is not the owner and presale is not started
  if (!presaleStarted) {
    return (
      <div className={styles.description}>Presale hasnt started!</div>
    )
  }

  // If Parsale is started allow for minting
  if (presaleStarted && !presaleEnded) {
    return (
      <div>
        <div className={styles.description}>
          Presale has started!!! If your address is whitelisted, Mint a Crypto
          Dev 🥳
        </div>
        <button className={styles.button} onClick={presaleMint}>
          Presale Mint 🚀
        </button>
      </div>
    )
  }

  // If Parsale started and ended allow public minting
  if (presaleStarted && presaleEnded) {
    return (
      <button className={styles.button} onClick={publicMint}>
        Public Mint 🚀
      </button>
    )
  };
  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  );
}
