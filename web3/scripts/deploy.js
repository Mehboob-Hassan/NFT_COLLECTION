require("dotenv").config({ path : "env"})
const {WHITELIST_CONTRACT_ADDRESS, METADATA_URL} = require('../constants')

async function main() {
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  const metadata_url = METADATA_URL;

  const CryptoDev = await hre.ethers.getContractFactory("CryptoDevs");
  const cryptoDev = await CryptoDev.deploy(
    whitelistContract,
    metadata_url
  );

  await cryptoDev.deployed();

  console.log("Token deployed on address: ", cryptoDev.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// 0xEA8182A5966Fb58b0D209038e2cc4cA57D865Fca
// Contract Deployed on Goerli