import { useState } from 'react'
import { useAccount, useReadContracts, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract'
import CertificateItem from './CertificateItem'

const MAX_TOKEN_ID_TO_CHECK = 50 // adjust upward later if you issue more certificates

function StudentPortal() {
  const { address } = useAccount()
  const [copied, setCopied] = useState(false)

  const { data: totalIssued } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalIssued',
  })

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
    <div className="max-w-2xl mx-auto mt-6 card p-6 shadow-md" style={{ color: 'var(--text)' }}>
      {totalIssued !== undefined && (
        <p className="text-center text-sm text-muted mb-4">
          🎓 <span className="font-semibold" style={{ color: 'var(--text)' }}>{totalIssued.toString()}</span> certificates issued so far on SmartCert
        </p>
      )}

      {address && (
        <div className="mb-6 pb-6 flex flex-col sm:flex-row items-center gap-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="text-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(verifyUrl)}`}
              alt="QR code linking to certificate verification"
              width={140}
              height={140}
              className="mx-auto rounded"
              style={{ border: '1px solid var(--border)' }}
            />
            <p className="text-xs text-muted mt-2">Scan to verify certificates</p>
          </div>
          <div className="flex-1 w-full">
            <p className="text-sm text-muted mb-1">Your public wallet address:</p>
            <div className="flex items-center gap-2">
              <code className="text-xs px-2 py-1 rounded break-all flex-1" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
                {address}
              </code>
              <button
                onClick={copyAddress}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 whitespace-nowrap"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-muted mt-2">
              Add this address or QR code to your resume so employers can verify your certificates.
            </p>
          </div>
        </div>
      )}

      <h2 className="font-display text-xl font-bold mb-4">My Certificates</h2>

      {loading && <p className="text-muted">Loading certificates...</p>}
      {!loading && ownedTokenIds.length === 0 && (
        <p className="text-muted">No certificates found for this wallet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {certificates?.map((result, i) => {
          const cert = result.result
          if (!cert) return null
          const tokenId = ownedTokenIds[i]
          return (
            <CertificateItem
              key={tokenId}
              cert={cert}
              tokenId={tokenId}
              onViewEtherscan={() => openOnEtherscan(tokenId)}
            />
          )
        })}
      </div>
    </div>
  )
}

export default StudentPortal