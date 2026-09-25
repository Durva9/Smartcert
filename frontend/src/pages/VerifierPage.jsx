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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-2">Verify a Certificate</h2>
          <p className="text-sm text-gray-500 mb-4">
            Enter a student's wallet address to see their verified SmartCert credentials.
            No wallet connection or fee required.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Wallet address (0x...)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 border rounded px-3 py-2 font-mono text-sm"
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
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-center">
            ❌ That doesn't look like a valid wallet address.
          </div>
        )}

        {hasSearched && isValidAddress && loading && (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
            Checking blockchain records...
          </div>
        )}

        {hasSearched && isValidAddress && !loading && ownedTokenIds.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg text-center">
            ⚠️ UNVERIFIED — No SmartCert certificates found for this address.
          </div>
        )}

        {hasSearched && isValidAddress && !loading && ownedTokenIds.length > 0 && (
          <div>
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-center mb-4 font-semibold">
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
                    className="bg-white border-t-4 border-green-600 rounded-lg shadow p-4"
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
        )}
      </div>
    </Layout>
  )
}

export default VerifierPage