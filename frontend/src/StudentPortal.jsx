import { useState } from 'react'
import { useAccount, useReadContracts } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract'

const MAX_TOKEN_ID_TO_CHECK = 50 // adjust upward later if you issue more certificates

function StudentPortal() {
  const { address } = useAccount()
  const [copied, setCopied] = useState(false)

  function copyAddress() {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const verifyUrl = address ? `${window.location.origin}/verifier?address=${address}` : ''

  const tokenIdRange = Array.from({ length: MAX_TOKEN_ID_TO_CHECK }, (_, i) => i + 1)

  const { data: ownerResults, isLoading: loadingOwners } = useReadContracts({
    contracts: tokenIdRange.map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'ownerOf',
      args: [id],
    })),
    query: { enabled: !!address },
  })

  const ownedTokenIds = ownerResults
    ? tokenIdRange.filter((id, i) => {
        const result = ownerResults[i]
        return (
          result?.status === 'success' &&
          result.result?.toLowerCase() === address?.toLowerCase()
        )
      })
    : []

  const { data: certificates, isLoading: loadingCerts } = useReadContracts({
    contracts: ownedTokenIds.map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getCertificate',
      args: [id],
    })),
    query: { enabled: ownedTokenIds.length > 0 },
  })

  const loading = loadingOwners || (ownedTokenIds.length > 0 && loadingCerts)

  function openOnEtherscan(tokenId) {
    const url = "https://sepolia.etherscan.io/token/" + CONTRACT_ADDRESS + "?a=" + tokenId
    window.open(url, "_blank")
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 bg-white p-6 rounded-lg shadow-md">
      {address && (
        <div className="mb-6 pb-6 border-b flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(verifyUrl)}`}
              alt="QR code linking to certificate verification"
              width={140}
              height={140}
              className="mx-auto border rounded"
            />
            <p className="text-xs text-gray-400 mt-2">Scan to verify certificates</p>
          </div>
          <div className="flex-1 w-full">
            <p className="text-sm text-gray-600 mb-1">Your public wallet address:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all flex-1">
                {address}
              </code>
              <button
                onClick={copyAddress}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Add this address or QR code to your resume so employers can verify your certificates.
            </p>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">My Certificates</h2>

      {loading && <p className="text-gray-500">Loading certificates...</p>}
      {!loading && ownedTokenIds.length === 0 && (
        <p className="text-gray-500">No certificates found for this wallet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {certificates?.map((result, i) => {
          const cert = result.result
          if (!cert) return null
          const tokenId = ownedTokenIds[i]
          return (
            <div
              key={tokenId}
              className="border-t-4 border-blue-600 rounded-lg shadow p-4"
            >
              <p className="text-xs text-gray-400 mb-1">Token ID #{tokenId}</p>
              <h3 className="font-bold text-lg">{cert.courseName}</h3>
              <p className="text-sm text-gray-600">
                Awarded to <span className="font-medium">{cert.studentName}</span>
              </p>
              <p className="text-sm text-gray-600">Issued: {cert.issueDate}</p>
              <button
                onClick={() => openOnEtherscan(tokenId)}
                className="text-xs text-blue-600 underline mt-2 inline-block bg-transparent border-none cursor-pointer p-0"
              >
                View on Etherscan
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StudentPortal