require("dotenv").config({ path : "env"})
const {WHITELIST_CONTRACT_ADDRESS, METADATA_URL} = require('../constants')

async function main() {
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  const metadata_url = METADATA_URL;

  const Lock = await hre.ethers.getContractFactory("CryptoDevs");
  const lock = await Lock.deploy(
    whitelistContract,
    metadata_url
  );

  await lock.deployed();

  console.log("Token deployed on address: ", lock.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512