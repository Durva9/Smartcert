import { PinataSDK } from 'pinata'

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: 'gateway.pinata.cloud',
})

export async function uploadMetadataToIPFS(metadata) {
  const upload = await pinata.upload.public.json(metadata)
  return `ipfs://${upload.cid}`
}