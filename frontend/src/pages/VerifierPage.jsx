import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useReadContracts } from 'wagmi'
import Layout from '../Layout'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract'

const MAX_TOKEN_ID_TO_CHECK = 50

function VerifierPage() {
  const [searchParams] = useSearchParams()
  const [inputValue, setInputValue] = useState('')
  const [searchAddress, setSearchAddress] = useState('')

  useEffect(() => {
    const fromUrl = searchParams.get('address')
    if (fromUrl) {
      setInputValue(fromUrl)
      setSearchAddress(fromUrl)
    }
  }, [searchParams])

  const tokenIdRange = Array.from({ length: MAX_TOKEN_ID_TO_CHECK }, (_, i) => i + 1)

  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(searchAddress)

  const { data: ownerResults, isLoading: loadingOwners } = useReadContracts({
    contracts: tokenIdRange.map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'ownerOf',
      args: [id],
    })),
    query: { enabled: isValidAddress },
  })

  const ownedTokenIds = ownerResults
    ? tokenIdRange.filter((id, i) => {
        const result = ownerResults[i]
        return (
          result?.status === 'success' &&
          result.result?.toLowerCase() === searchAddress?.toLowerCase()
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
  const hasSearched = searchAddress.length > 0

  function handleSearch(e) {
    e.preventDefault()
    setSearchAddress(inputValue.trim())
  }

  function openOnEtherscan(tokenId) {
    const url = `https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${tokenId}`
    window.open(url, '_blank')
  }

  return (
    <Layout showWallet={false}>
      <div className="max-w-2xl mx-auto" style={{ color: 'var(--text)' }}>
        <div className="card p-6 mb-6">
          <h2 className="font-display text-xl font-bold mb-2">Verify a Certificate</h2>
          <p className="text-sm text-muted mb-4">
            Enter a student's wallet address to see their verified SmartCert credentials.
            No wallet connection or fee required.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Wallet address (0x...)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 input-field px-3 py-2 font-mono text-sm"
            />
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Verify
            </button>
          </form>
        </div>

        {hasSearched && !isValidAddress && (
          <div className="card p-4 text-center" style={{ borderColor: '#ef4444', color: '#f87171' }}>
            ❌ That doesn't look like a valid wallet address.
          </div>
        )}

        {hasSearched && isValidAddress && loading && (
          <div className="card p-6 text-center text-muted">
            Checking blockchain records...
          </div>
        )}

        {hasSearched && isValidAddress && !loading && ownedTokenIds.length === 0 && (
          <div className="card p-4 text-center" style={{ borderColor: '#eab308', color: '#facc15' }}>
            ⚠️ UNVERIFIED — No SmartCert certificates found for this address.
          </div>
        )}

        {hasSearched && isValidAddress && !loading && ownedTokenIds.length > 0 && (
          <div>
            <div
              className="card p-4 text-center mb-4 font-semibold"
              style={{ borderColor: '#22c55e', color: '#4ade80' }}
            >
              ✅ VERIFIED & AUTHENTIC — {ownedTokenIds.length} certificate(s) found
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {certificates?.map((result, i) => {
                const cert = result.result
                if (!cert) return null
                const tokenId = ownedTokenIds[i]
                return (
                  <div
                    key={tokenId}
                    className="card p-4"
                    style={{ borderTop: '4px solid #22c55e' }}
                  >
                    <p className="text-xs text-muted mb-1">Token ID #{tokenId}</p>
                    <h3 className="font-display font-bold text-lg">{cert.courseName}</h3>
                    <p className="text-sm text-muted">
                      Awarded to <span className="font-medium" style={{ color: 'var(--text)' }}>{cert.studentName}</span>
                    </p>
                    <p className="text-sm text-muted">Issued: {cert.issueDate}</p>
                    <button
                      onClick={() => openOnEtherscan(tokenId)}
                      className="text-xs underline mt-2 inline-block bg-transparent border-none cursor-pointer p-0"
                      style={{ color: 'var(--accent)' }}
                    >
                      View on Etherscan
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default VerifierPage