import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccount, useReadContracts, useReadContract } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract'
import CertificateItem from './CertificateItem'

function StudentPortal() {
  const { address, isConnected } = useAccount()
  const [copied, setCopied] = useState(false)

  const { data: totalIssued, isLoading: loadingTotal } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalIssued',
  })

  function copyAddress() {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const verifyUrl = address ? `${window.location.origin}/verifier?address=${address}` : ''

  const totalCount = totalIssued !== undefined ? Number(totalIssued) : 0
  const tokenIdRange = Array.from({ length: totalCount }, (_, i) => BigInt(i + 1))

  const { data: ownerResults, isLoading: loadingOwners } = useReadContracts({
    contracts: tokenIdRange.map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'ownerOf',
      args: [id],
    })),
    query: { enabled: !!address && tokenIdRange.length > 0 },
  })

  const ownedTokenIds = ownerResults && tokenIdRange.length > 0
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

  const { data: revokedResults } = useReadContracts({
    contracts: ownedTokenIds.map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'isCertificateRevoked',
      args: [id],
    })),
    query: { enabled: ownedTokenIds.length > 0 },
  })

  const loading = loadingTotal || loadingOwners || (ownedTokenIds.length > 0 && loadingCerts)

  function openOnEtherscan(tokenId) {
    const url = "https://sepolia.etherscan.io/token/" + CONTRACT_ADDRESS + "?a=" + tokenId
    window.open(url, "_blank")
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 card p-6 shadow-md" style={{ color: 'var(--text)' }}>
      {totalIssued !== undefined && (
        <p className="text-center text-sm text-muted mb-4">
          🎓 <span className="font-semibold" style={{ color: 'var(--text)' }}>{totalIssued.toString()}</span> certificate{totalIssued === 1n ? '' : 's'} issued so far on SmartCert
        </p>
      )}

      {!isConnected ? (
        <div className="text-center py-10">
          <p className="text-base font-medium mb-2">Connect Your Student Wallet</p>
          <p className="text-sm text-muted mb-4">
            Connect the MetaMask account that received the certificate to view and download your credentials.
          </p>
        </div>
      ) : (
        <>
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
              <p className="text-sm text-muted mb-1">Connected Student Wallet:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs px-2 py-1 rounded break-all flex-1" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
                  {address}
                </code>
                <button
                  onClick={copyAddress}
                  className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 whitespace-nowrap cursor-pointer"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-muted mt-2">
                Add this address or QR code to your resume so employers can verify your certificates.
              </p>
            </div>
          </div>

          <h2 className="font-display text-xl font-bold mb-4">My Certificates</h2>

          {loading && <p className="text-muted">Loading certificates...</p>}

          {!loading && ownedTokenIds.length === 0 && (
            <div className="p-4 rounded-lg bg-neutral-900/40 border border-neutral-800 text-sm space-y-2">
              <p className="font-medium text-amber-400">
                No certificates found for this wallet address.
              </p>
              <p className="text-xs text-muted">
                Currently connected to: <code className="text-[11px] px-1 py-0.5 rounded bg-neutral-800">{address}</code>
              </p>
              <div className="text-xs text-neutral-400 pt-2 border-t border-neutral-800 space-y-1">
                <p>
                  👉 <strong>Issued to a different student address?</strong> Switch your active account in MetaMask to the student wallet you entered when minting.
                </p>
                <p>
                  👉 <strong>Want to verify any address or Token ID directly?</strong> Visit the{' '}
                  <Link to="/verifier" className="text-indigo-400 underline font-medium">
                    Public Verifier Portal
                  </Link>.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {certificates?.map((result, i) => {
              const cert = result.result
              if (!cert) return null
              const tokenId = ownedTokenIds[i]
              const isRevoked = Boolean(revokedResults?.[i]?.result)
              return (
                <CertificateItem
                  key={tokenId.toString()}
                  cert={cert}
                  tokenId={tokenId.toString()}
                  isRevoked={isRevoked}
                  onViewEtherscan={() => openOnEtherscan(tokenId)}
                />
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default StudentPortal