require("dotenv").config();
const { PinataSDK } = require("pinata");

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: "gateway.pinata.cloud",
});

async function main() {
  // A sample certificate metadata object, following common NFT metadata format
  const metadata = {
    name: "B.Tech Computer Science Certificate",
    description: "Awarded to Durva Amin for completing B.Tech Computer Science",
    attributes: [
      { trait_type: "Student Name", value: "Durva Amin" },
      { trait_type: "Course", value: "B.Tech Computer Science" },
      { trait_type: "Issue Date", value: "2026-09-23" },
    ],
  };

  const upload = await pinata.upload.public.json(metadata);

  console.log("Uploaded! CID:", upload.cid);
  console.log("View at:", `https://gateway.pinata.cloud/ipfs/${upload.cid}`);
}

main().catch(console.error);