let biconomy;
let xayaDeligationContract;
const nativeEthereum = window.ethereum;
let onConnectMethod;
let calledConnectWeb3 = false;
let onConnectCalled = false;
let doneInit = false;
let onDisconnectMethod;
let userAddress;
let smartAccount;

const clientId =
  "BASm6w35IsZTjGmgAbrHu1mewaKEx4JcamFH2oDl7LcQ7OuEXrDKXjZB7fpT9P0q80NuFu7yH_q6JxTMGdCdtkg";

const web3auth = new Modal.Web3Auth({
  clientId,
  web3AuthNetwork: "mainnet",
  authMode: nativeEthereum === undefined ? "WALLET" : "DAPP",
  chainConfig: {
    chainNamespace: "eip155",
    chainId: "0x89",
    rpcTarget: "https://polygon-rpc.com/",
  },
  uiConfig: {
    theme: "dark",
    loginMethodsOrder: ["google"],
    appLogo: "https://downloads.soccerverse.pro/soccerverse-logo.png", // Your App Logo Here
  },
});

web3auth.addListener("connected", async () => {
  console.log("came here");
  try {
    // const walletProvider = new ethers.providers.Web3Provider(web3auth.provider);
    // let options = {
    //   activeNetworkId: coreTypes.ChainId.POLYGON_MAINNET,
    //   supportedNetworksIds: [coreTypes.ChainId.POLYGON_MAINNET],
    //   networkConfig: [
    //     {
    //       chainId: coreTypes.ChainId.POLYGON_MAINNET,
    //       dappAPIKey: "4MrOmsBnw.b2e303ea-118f-4442-9716-96d6df7d50bd",
    //     },
    //   ],
    // };
    // smartAccount = new SmartAccount.default(walletProvider, options);
    // smartAccount = await smartAccount.init();
    // const deployTx = await smartAccount.deployWalletUsingPaymaster();
    // console.log("deployWalletUsingPaymaster ", deployTx);
    // const encodedData = xayaAccountInterface.encodeFunctionData(
    //   "setApprovalForAll",
    //   ["0xEB4c2EF7874628B646B8A59e4A309B94e14C2a6B", true]
    // );
    // const tx = {
    //   to: "0x8C12253F71091b9582908C8a44F78870Ec6F304F", // destination smart contract address
    //   data: encodedData,
    // };
    // smartAccount.on("txHashGenerated", (response) => {
    //   console.log("txHashGenerated event received via emitter", response);
    // });
    // smartAccount.on("onHashChanged", (response) => {
    //   console.log("onHashChanged event received via emitter", response);
    // });
    // // Event listener that gets triggered once a transaction is mined
    // smartAccount.on("txMined", (response) => {
    //   console.log("txMined event received via emitter", response);
    // });
    // // Event listener that gets triggered on any error
    // smartAccount.on("error", (response) => {
    //   console.log("error event received via emitter", response);
    // });
    // const txResponse = await smartAccount.sendTransaction({ transaction: tx });
    // console.log("userOp hash", txResponse.hash);
    // // If you do not subscribe to listener, one can also get the receipt like shown below
    // const txReciept = await txResponse.wait();
    // console.log("Tx hash", txReciept.transactionHash);
  } catch (e) {
    console.log("Got error ", e);
  }
});

function getWeb3AuthStatus() {
  return web3auth.status;
}

// web3auth.addListener("connecting", async () => {
//     console.log("got connecting event--->");
//     await new Promise(resolve => setTimeout(resolve, 5000));
//     if (web3auth.status === "connecting" && !calledConnectWeb3) {
//         await logout();
//         web3auth.clearCache();
//         await initWeb3Auth();
//         connectToWeb3Auth();
//     }
//     if (web3auth.status === "connected" && !onConnectCalled) {
//         if (onConnectMethod) {
//             onConnectMethod();
//         }
//     }
//     doneInit = true;
// });

async function waitForTransactions(txHash) {
  try {
    const ethersProvider = new ethers.providers.Web3Provider(web3auth.provider);
    const resp = await ethersProvider.waitForTransaction(txHash);
    console.log("resp:", resp);
    if (resp.status == 1) {
      return JSON.stringify({
        status: true,
        error: "",
      });
    }
    try {
      const response = await fetch(
        `https://api.tenderly.co/api/v1/public-contract/137/tx/${txHash}`,
        {
          headers: {
            authority: "api.tenderly.co",
            accept: "application/json, text/plain, */*",
            "accept-language": "fa,en-US;q=0.9,en;q=0.8,es;q=0.7",
            origin: "https://dashboard.tenderly.co",
            referer: "https://dashboard.tenderly.co/",
          },
          compress: true,
        }
      );
      const data = await response.json();
      console.log(data);
      return JSON.stringify({
        status: false,
        error: data.error_message,
      });
    } catch (e) {
      console.log("error in waitForTransactions fetch --->", e);
      return JSON.stringify({
        status: false,
        error: "",
      });
    }
  } catch (e) {
    console.log("error in waitForTransactions --->", e);
    return JSON.stringify({
      status: false,
      error: "",
    });
  }
}

async function getNames(balance) {
  try {
    const caddress = "0x8C12253F71091b9582908C8a44F78870Ec6F304F";
    requests = [];
    for (var i = 0; i < balance; i++) {
      requests.push({
        jsonrpc: "2.0",
        id: i,
        method: "eth_call",
        params: [
          {
            to: caddress,
            data: xayaAccountInterface.encodeFunctionData(
              xayaAccountInterface.getSighash("tokenOfOwnerByIndex"),
              [userAddress, i]
            ),
          },
          "latest",
        ],
      });
    }
    const response = await fetch("https://polygon-rpc.com/", {
      method: "POST",
      body: JSON.stringify(requests),
      headers: { "Content-Type": "application/json" },
    });
    const results = await response.json();
    requests = [];
    for (result of results) {
      requests.push({
        jsonrpc: "2.0",
        id: result.id,
        method: "eth_call",
        params: [
          {
            to: caddress,
            data: xayaAccountInterface.encodeFunctionData(
              xayaAccountInterface.getSighash("tokenIdToName"),
              [result.result]
            ),
          },
          "latest",
        ],
      });
    }
    console.log(JSON.stringify(requests));
    const response2 = await fetch("https://polygon-rpc.com/", {
      method: "POST",
      body: JSON.stringify(requests),
      headers: { "Content-Type": "application/json" },
    });
    const results2 = await response2.json();
    const names = results2.map((e) => {
      return ethers.utils.defaultAbiCoder.decode(
        ["string", "string"],
        e.result
      )[1];
    });
    console.log(names);
    return names;
  } catch (_) {
    return [];
  }
}

function isEthereumEnabled() {
  try {
    return typeof ethereum !== "undefined";
  } catch (_) {
    return false;
  }
}

async function initWeb3Auth() {
  if (web3auth.status == "ready" || web3auth.status == "connected") {
    return;
  }
  try {
    window.ethereum = nativeEthereum;
    // const openloginAdapter = new OpenloginAdapter.OpenloginAdapter({
    //     loginSettings: {
    //         mfaLevel: "default",
    //     },
    //     sessionTime: 3600,
    //     adapterSettings: {
    //         uxMode: "popup",
    //         network: "mainnet",
    //         whiteLabel: {
    //             name: "Soccerverse",
    //             logoLight: "https://downloads.soccerverse.pro/soccerverse-logo.png",
    //             logoDark: "https://downloads.soccerverse.pro/soccerverse-logo.png",
    //             defaultLanguage: "en",
    //             dark: true,
    //         },
    //     }
    // });
    // web3auth.configureAdapter(openloginAdapter);
    const torusPlugin =
      new TorusWalletConnectorPlugin.TorusWalletConnectorPlugin({
        torusWalletOpts: {},
        walletInitOptions: {
          whiteLabel: {
            theme: { isDark: true },
            logoDark: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
            logoLight: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
          },
          useWalletConnect: false, // make sure this is enabled before using the showWalletConnectScanner function
          enableLogging: true,
        },
      });
    await web3auth.addPlugin(torusPlugin);
    await web3auth.initModal({
      modalConfig: {
        ["wallet-connect-v1"]: {
          showOnModal: false,
        },
        ["metamask"]: {
          showOnModal: nativeEthereum !== undefined,
        },
        ["wallet-connect-v2"]: {
          showOnModal: false,
        },
        ["torus-evm"]: {
          showOnModal: false,
        },
        ["coinbase"]: {
          showOnModal: false,
        },
        ["torus-solana"]: {
          showOnModal: false,
        },
        ["phantom"]: {
          showOnModal: false,
        },
        ["slope"]: {
          showOnModal: false,
        },
        ["solflare"]: {
          showOnModal: false,
        },
        // ["openlogin"]: {
        //     label: "openlogin",
        //     loginMethods: {
        //         google: {
        //             showOnModal: true,
        //         },
        //         facebook: {
        //             showOnModal: true,
        //         },
        //         line: {
        //             showOnModal: false,
        //         },
        //         github: {
        //             showOnModal: false,
        //         },
        //         apple: {
        //             showOnModal: false,
        //         },
        //         twitch: {
        //             showOnModal: false,
        //         },
        //         discord: {
        //             showOnModal: true,
        //         },
        //         reddit: {
        //             showOnModal: true,
        //         },
        //         sms_passwordless: {
        //             showOnModal: false,
        //         },
        //         wechat: {
        //             showOnModal: false,
        //         },
        //         weibo: {
        //             showOnModal: false,
        //         },
        //         twitter: {
        //             showOnModal: false,
        //         },
        //         linkedin: {
        //             showOnModal: false,
        //         },
        //         kakao: {
        //             showOnModal: false,
        //         },
        //         jwt: {
        //             showOnModal: false,
        //         }
        //     },
        //     showOnModal: true,
        // },
      },
    });
    if (web3auth.provider) {
      if (onConnectMethod && !onConnectCalled) {
        onConnectCalled = true;
        onConnectMethod();
      }
    }
  } catch (e) {
    console.log("Error in web3 init -- ", e);
  }
}

function initBiconomy() {
  if (web3auth.provider && !biconomy) {
    biconomy = new Biconomy(web3auth.provider, {
      apiKey: "8OQIVmOJ1.3fa4ac45-8278-40b7-9d13-407c5faeec39",
      debug: true,
      contractAddresses: [
        "0xEB4c2EF7874628B646B8A59e4A309B94e14C2a6B",
        "0x8C12253F71091b9582908C8a44F78870Ec6F304F",
      ],
    });
  }
}

async function connectToWeb3Auth() {
  try {
    // if (web3auth.status === "connecting" && !doneInit && !onConnectCalled) {
    //     web3auth.clearCache();
    // } else
    if (web3auth.status === "connected" || web3auth.status === "connecting") {
      return;
    }
    if (
      web3auth.status != "ready" &&
      web3auth.status != "connected" &&
      web3auth.status != "connecting"
    ) {
      await initWeb3Auth();
    }
    window.ethereum = nativeEthereum;
    calledConnectWeb3 = true;
    web3auth.connect();
  } catch (error) {
    console.error(error.message);
  }
}

function connectedWallet() {
  return web3auth.connectedAdapterName;
}

async function setPermitOperatorThroughBiconomy() {
  try {
    const ethersProvider = new ethers.providers.Web3Provider(biconomy);
    const walletSigner = ethersProvider.getSigner();
    userAddress = await walletSigner.getAddress();
    xayaAccountContract = new ethers.Contract(
      "0x8C12253F71091b9582908C8a44F78870Ec6F304F",
      xayaAccountInterface.format(),
      walletSigner
    );
    let signature = await xayaAccountContract.permitOperatorMessage(
      "0xEB4c2EF7874628B646B8A59e4A309B94e14C2a6B"
    );
    const bytes = CryptoJS.enc.Hex.parse(signature.substring(2));
    const decodedMessage = CryptoJS.enc.Utf8.stringify(bytes);
    let singedMessage = await walletSigner.signMessage(decodedMessage);
    if (singedMessage) {
      let { data } =
        await xayaAccountContract.populateTransaction.permitOperator(
          "0xEB4c2EF7874628B646B8A59e4A309B94e14C2a6B",
          singedMessage
        );
      let txParams = {
        data: data,
        to: xayaAccountContract.address,
        from: userAddress,
        gasLimit: "500000",
        signatureType: "EIP712_SIGN",
      };
      const result = await ethersProvider.send("eth_sendTransaction", [
        txParams,
      ]);
      console.log(result);
      return result;
    }
  } catch (e) {
    console.log("error in setPermitOperatorThroughBiconomy", e);
    return "error " + e.toString();
  }
}

async function biconomySendData(ns, name, path, mv, nonce, amount, receiver) {
  try {
    const ethersProvider = new ethers.providers.Web3Provider(biconomy);
    const walletSigner = ethersProvider.getSigner();
    userAddress = await walletSigner.getAddress();
    xayaDeligationContract = new ethers.Contract(
      "0xEB4c2EF7874628B646B8A59e4A309B94e14C2a6B",
      xayaDeligationInterface.format(),
      walletSigner
    );
    // const gasEstimate = await xayaDeligationContract.estimateGas.sendHierarchicalMove(ns, name, path, mv, ethers.BigNumber.from(nonce), ethers.BigNumber.from(amount), receiver, { from: userAddress });
    // const gasBuffer = gasEstimate.mul(130).div(100);
    let { data } =
      await xayaDeligationContract.populateTransaction.sendHierarchicalMove(
        ns,
        name,
        path,
        mv,
        ethers.BigNumber.from(nonce),
        ethers.BigNumber.from(amount),
        receiver
      );
    let txParams = {
      data: data,
      to: xayaDeligationContract.address,
      from: userAddress,
      gasLimit: "500000",
      signatureType: "EIP712_SIGN",
    };
    const result = await ethersProvider.send("eth_sendTransaction", [txParams]);
    console.log(result);
    return result;
  } catch (e) {
    console.log("error in biconomySendData", e);
    return "error " + e.toString();
  }
}

function initBiconomyListners() {
  biconomy.on("txHashGenerated", function (data) {
    console.log("Biconomy txHashGenerated:", data);
  });

  biconomy.on("txMined", function (data) {
    console.log("Biconomy txMined:", data);
  });
  biconomy.on("onError", function (data) {
    console.log("Biconomy onError:", data);
  });
  biconomy.on("txHashChanged", function (data) {
    console.log("Biconomy txHashChanged:", data);
  });
}

// function initBiconomyListners(onTxHashGenerated, onTxMined, onError, onTxHashChanged) {
//     biconomy.on("txHashGenerated", function (data) {
//         onTxHashGenerated(JSON.stringify(data));
//         console.log(data);
//     });
//     biconomy.on("txMined", function (data) {
//         onTxMined(JSON.stringify(data));
//         console.log(data);
//     });
//     biconomy.on("onError", function (data) {
//         onError(JSON.stringify(data));
//         console.log(data);
//     });
//     biconomy.on("txHashChanged", function (data) {
//         onTxHashChanged(JSON.stringify(data));
//         console.log(data);
//     });
// }

function getCurrentWeb3AuthStatus() {
  return web3auth.status;
}

function initWeb3AuthListners(onDisconnect, onConnect, onError) {
  console.log("called initWeb3AuthListners");
  onConnectMethod = onConnect;
  onDisconnectMethod = onDisconnect;
  web3auth.addListener("connected", () => {
    console.log("connect from event");
    const ethersProvider = new ethers.providers.Web3Provider(web3auth.provider);
    const walletSigner = ethersProvider.getSigner();
    xayaDeligationContract = new ethers.Contract(
      "0xEB4c2EF7874628B646B8A59e4A309B94e14C2a6B",
      xayaDeligationInterface.format(),
      walletSigner
    );
    walletSigner.getAddress().then((address) => {
      userAddress = address;
    });
    initBiconomy();
    window.ethereum = web3auth.provider;
    if (!onConnectCalled) {
      onConnectCalled = true;
      onConnect();
    }
    if (web3auth.connectedAdapterName === "metamask") {
      window.ethereum.on("disconnect", () => {
        onConnectCalled = false;
        onDisconnect();
      });
      window.ethereum.on("accountsChanged", () => {
        onConnectCalled = false;
        onDisconnect();
      });
    } else {
      web3auth.addListener("disconnected", () => {
        onConnectCalled = false;
        window.ethereum = nativeEthereum;
        onDisconnect();
      });
    }
  });
  web3auth.addListener("disconnected", () => {
    console.log("disconnected from event");
    onConnectCalled = false;
    onDisconnect();
    window.ethereum = nativeEthereum;
  });
  web3auth.addListener("errored", () => {
    console.log("got error --- > ");
    onError();
  });
}

async function getUserInfo() {
  try {
    const user = await web3auth.getUserInfo();
    console.log(user);
    return JSON.stringify(user);
  } catch (error) {
    console.error(error.message);
    return "failed";
  }
}

async function logout() {
  try {
    window.ethereum = nativeEthereum;
    await web3auth.logout();
    onConnectCalled = false;
    //initWeb3Auth();
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
}

async function getAddress() {
  const ethersProvider = new ethers.providers.Web3Provider(web3auth.provider);
  const signer = ethersProvider.getSigner();
  const address = await signer.getAddress();
  return address[0];
}

async function hasAccess(username) {
  let paths = ["g", "smc", "tv", "f"];
  return await xayaDeligationContract.hasAccess(
    "p",
    username,
    paths,
    "0x5aFE45Fc2eE83efA21C357A91A18446AA42a2fC8",
    30000
  );
}

// window.onload = function () {
//     initWeb3Auth();
// };
