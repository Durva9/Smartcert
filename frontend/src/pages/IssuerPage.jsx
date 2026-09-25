import { useAccount, useReadContract } from 'wagmi'
import Layout from '../Layout'
import IssuerPortal from '../IssuerPortal'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract'

function IssuerPage() {
  const { address, isConnected } = useAccount()

  const { data: owner, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  })

  const isOwner = isConnected && owner && address?.toLowerCase() === owner.toLowerCase()

  return (
    <Layout>
      {!isConnected && (
        <p className="text-center text-gray-500">
          Connect your wallet to access the Issuer Portal.
        </p>
      )}

      {isConnected && isLoading && (
        <p className="text-center text-gray-500">Checking permissions...</p>
      )}

      {isConnected && !isLoading && !isOwner && (
        <p className="text-center text-red-600 max-w-md mx-auto">
          This wallet is not authorized to issue certificates. Only the university's
          registered issuer wallet can access this page.
        </p>
      )}

      {isConnected && isOwner && <IssuerPortal />}
    </Layout>
  )
}

export default IssuerPage