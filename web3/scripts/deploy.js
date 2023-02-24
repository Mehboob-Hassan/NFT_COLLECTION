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

// 0xc11afEe5C12Ac25c70f2DA074da1518bA344D61c
// Contract Deployed on BCB