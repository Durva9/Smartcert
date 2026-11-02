import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useReadContracts, useReadContract } from 'wagmi'
import { readContract } from 'wagmi/actions'
import { isHex, pad, toHex } from 'viem'
import Layout from '../Layout'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract'
import { config } from '../wagmi'
import { verifyCertPDF, parseCertPDF } from '../pdfVerify'
import { fetchCertificateMetadata } from '../ipfs'
import CertificateCard from '../CertificateCard'

const MAX_TOKEN_ID_TO_CHECK = 50

function VerifierCardItem({ cert, tokenId, isRevoked, ownerAddress, onViewExplorer }) {
  const [metadata, setMetadata] = useState(null)
  const [showFullCert, setShowFullCert] = useState(false)

  useEffect(() => {
    let active = true
    async function loadMeta() {
      if (cert?.metadataURI) {
        const meta = await fetchCertificateMetadata(cert.metadataURI)
        if (active && meta) {
          setMetadata(meta)
        }
      }
    }
    loadMeta()
    return () => {
      active = false
    }
  }, [cert?.metadataURI])

  const templateId = metadata?.templateId || 'classic'
  const academic = metadata?.academicData || {}

  return (
    <div
      className="card p-5 relative overflow-hidden transition-all shadow-md"
      style={{
        border: `1px solid ${isRevoked ? '#dc2626' : 'var(--border)'}`,
        borderTop: `5px solid ${isRevoked ? '#dc2626' : '#22c55e'}`,
      }}
    >
      {/* Prominent Revocation Ribbon / Badge */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-muted">Token ID #{tokenId}</span>
        {isRevoked ? (
          <span className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-sm flex items-center gap-1.5 animate-pulse">
            ⛔ REVOKED
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
            ✓ VALID & VERIFIED
          </span>
        )}
      </div>

      <h3 className="font-display font-bold text-lg leading-tight mb-1">{cert.courseName}</h3>
      <p className="text-sm text-muted">
        Awarded to <span className="font-semibold" style={{ color: 'var(--text)' }}>{cert.studentName}</span>
      </p>

      {academic.specializationTrack && (
        <p className="text-xs text-indigo-400 mt-1">
          Track: {academic.specializationTrack}
        </p>
      )}

      {academic.gradeDistinction && (
        <p className="text-xs text-amber-400 font-medium mt-0.5">
          Distinction: {academic.gradeDistinction}
        </p>
      )}

      <div className="mt-3 pt-3 border-t text-xs space-y-1 text-muted" style={{ borderColor: 'var(--border)' }}>
        <p>Issued Date: <span className="font-medium" style={{ color: 'var(--text)' }}>{cert.issueDate}</span></p>
        {academic.creditHours && (
          <p>Credit Hours: <span className="font-medium" style={{ color: 'var(--text)' }}>{academic.creditHours}</span></p>
        )}
        {academic.signatoryName && (
          <p>Signatory: <span className="font-medium" style={{ color: 'var(--text)' }}>{academic.signatoryName} ({academic.signatoryTitle || 'Institutional Official'})</span></p>
        )}
        {ownerAddress && (
          <p className="truncate">
            Owner: <span className="font-mono text-[11px]" style={{ color: 'var(--text)' }}>{ownerAddress}</span>
          </p>
        )}
        <p>Template Style: <span className="capitalize font-semibold text-indigo-300">{templateId}</span></p>
      </div>

      {isRevoked && (
        <div className="mt-3 p-2.5 rounded bg-red-600/15 border border-red-600/40 text-xs text-red-400">
          <strong>Revocation Notice:</strong> This credential was permanently revoked by the issuing institution and is completely invalid.
        </div>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          onClick={() => setShowFullCert(!showFullCert)}
          className="text-xs px-3 py-1.5 rounded border font-medium cursor-pointer"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text)' }}
        >
          {showFullCert ? '✕ Hide Certificate' : '👁️ View Certificate'}
        </button>

        <button
          onClick={onViewExplorer}
          className="text-xs underline bg-transparent border-none cursor-pointer p-0"
          style={{ color: 'var(--accent)' }}
        >
          Explorer Record ↗
        </button>
      </div>

      {/* Rendered Certificate Card */}
      {showFullCert && (
        <div className="mt-4 p-2 rounded overflow-x-auto bg-neutral-900/50 border border-neutral-800 flex justify-center">
          <div style={{ transform: 'scale(0.68)', transformOrigin: 'top center', marginBottom: '-160px' }}>
            <CertificateCard
              cert={cert}
              tokenId={tokenId}
              metadata={metadata}
              template={templateId}
              isRevoked={isRevoked}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function VerifierPage() {
  const [searchParams] = useSearchParams()
  const [inputValue, setInputValue] = useState('')
  const [activeQuery, setActiveQuery] = useState('')

  // PDF verification state
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfResult, setPdfResult] = useState(null)
  const [pdfChecking, setPdfChecking] = useState(false)
  const [pdfError, setPdfError] = useState('')

  useEffect(() => {
    const fromUrl = searchParams.get('address') || searchParams.get('tokenId')
    if (fromUrl) {
      setInputValue(fromUrl)
      setActiveQuery(fromUrl.trim())
    }
  }, [searchParams])

  const trimmedQuery = activeQuery.trim()
  const isAddressQuery = /^0x[a-fA-F0-9]{40}$/.test(trimmedQuery)
  const isNumericQuery = /^\d+$/.test(trimmedQuery) && BigInt(trimmedQuery || 0) > 0n
  const isBytes32Query = /^0x[a-fA-F0-9]{64}$/.test(trimmedQuery)
  const hasSearched = trimmedQuery.length > 0

  // 1. SINGLE TOKEN QUERY (if user typed token ID or bytes32 certId)
  const queryTokenId = isNumericQuery ? BigInt(trimmedQuery) : null

  const { data: singleCert, isLoading: loadingSingleCert } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getCertificate',
    args: queryTokenId ? [queryTokenId] : undefined,
    query: { enabled: !!queryTokenId },
  })

  const { data: singleOwner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'ownerOf',
    args: queryTokenId ? [queryTokenId] : undefined,
    query: { enabled: !!queryTokenId },
  })

  const { data: singleRevoked } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'isCertificateRevoked',
    args: queryTokenId ? [queryTokenId] : isBytes32Query ? [trimmedQuery] : undefined,
    query: { enabled: !!queryTokenId || isBytes32Query },
  })

  // 2. WALLET ADDRESS QUERY
  const tokenIdRange = Array.from({ length: MAX_TOKEN_ID_TO_CHECK }, (_, i) => i + 1)

  const { data: ownerResults, isLoading: loadingOwners } = useReadContracts({
    contracts: tokenIdRange.map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'ownerOf',
      args: [id],
    })),
    query: { enabled: isAddressQuery },
  })

  const ownedTokenIds = ownerResults
    ? tokenIdRange.filter((id, i) => {
        const result = ownerResults[i]
        return (
          result?.status === 'success' &&
          result.result?.toLowerCase() === trimmedQuery.toLowerCase()
        )
      })
    : []

  const { data: addressCertificates, isLoading: loadingAddressCerts } = useReadContracts({
    contracts: ownedTokenIds.map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'getCertificate',
      args: [id],
    })),
    query: { enabled: ownedTokenIds.length > 0 },
  })

  const { data: addressRevokedResults } = useReadContracts({
    contracts: ownedTokenIds.map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'isCertificateRevoked',
      args: [BigInt(id)],
    })),
    query: { enabled: ownedTokenIds.length > 0 },
  })

  const isSearching = (isAddressQuery && (loadingOwners || loadingAddressCerts)) || (isNumericQuery && loadingSingleCert)

  function handleSearch(e) {
    e.preventDefault()
    setActiveQuery(inputValue.trim())
  }

  function openExplorer(tokenId) {
    const url = `https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${tokenId}`
    window.open(url, '_blank')
  }

  async function handlePdfCheck(e) {
    e.preventDefault()
    if (!pdfFile) return

    setPdfChecking(true)
    setPdfError('')
    setPdfResult(null)

    try {
      const { tokenId } = await parseCertPDF(pdfFile)

      const onChainCert = await readContract(config, {
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getCertificate',
        args: [BigInt(tokenId)],
      })

      // Check on-chain revocation status
      const isRevokedOnChain = await readContract(config, {
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'isCertificateRevoked',
        args: [BigInt(tokenId)],
      })

      const result = await verifyCertPDF(pdfFile, onChainCert)
      setPdfResult({ ...result, cert: onChainCert, isRevoked: isRevokedOnChain })
    } catch (err) {
      console.error(err)
      setPdfError(err.message || 'Could not verify this PDF.')
    } finally {
      setPdfChecking(false)
    }
  }

  return (
    <Layout showWallet={false}>
      <div className="max-w-3xl mx-auto space-y-6" style={{ color: 'var(--text)' }}>
        {/* HEADER & SEARCH FORM */}
        <div className="card p-6 shadow-md">
          <h2 className="font-display text-2xl font-bold mb-2">Public Certificate Verifier</h2>
          <p className="text-sm text-muted mb-4">
            Verify credentials on the Ethereum blockchain. Enter either a <strong>Student Wallet Address</strong> or a <strong>Certificate Token ID</strong>.
          </p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Enter Wallet Address (0x...) or Token ID (e.g. 1)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 input-field px-3.5 py-2.5 font-mono text-sm"
              required
            />
            <button
              type="submit"
              className="bg-purple-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-purple-700 transition cursor-pointer"
            >
              Verify Credential
            </button>
          </form>
        </div>

        {/* OR UPLOAD PDF */}
        <div className="card p-6 shadow-md">
          <h3 className="font-display text-lg font-bold mb-1">Verify Certificate PDF File</h3>
          <p className="text-xs text-muted mb-4">
            Upload an exported SmartCert PDF to verify its cryptographic hash and on-chain validity status.
          </p>
          <form onSubmit={handlePdfCheck} className="flex flex-col sm:flex-row gap-2">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
              className="flex-1 input-field px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={!pdfFile || pdfChecking}
              className="bg-teal-600 text-white font-medium px-5 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition cursor-pointer"
            >
              {pdfChecking ? 'Analyzing...' : 'Check PDF'}
            </button>
          </form>

          {pdfError && <p className="mt-3 text-sm text-red-400">{pdfError}</p>}

          {pdfResult && (
            <div
              className="mt-4 p-4 rounded-lg"
              style={{
                border: `1px solid ${
                  pdfResult.isRevoked
                    ? '#dc2626'
                    : pdfResult.isMatch
                    ? '#22c55e'
                    : '#ef4444'
                }`,
                backgroundColor: pdfResult.isRevoked
                  ? 'rgba(220, 38, 38, 0.1)'
                  : pdfResult.isMatch
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
              }}
            >
              {pdfResult.isRevoked ? (
                <div>
                  <div className="flex items-center gap-2 text-red-500 font-bold mb-1">
                    <span className="text-lg">⛔</span>
                    <span>REVOKED CREDENTIAL — Token #{pdfResult.tokenId}</span>
                  </div>
                  <p className="text-xs text-red-300">
                    While the cryptographic content of this PDF matches the historical issuance, this certificate was <strong>OFFICIALLY REVOKED</strong> on-chain by the issuing institution.
                  </p>
                </div>
              ) : pdfResult.isMatch ? (
                <div>
                  <div className="flex items-center gap-2 text-green-400 font-bold mb-1">
                    <span className="text-lg">✅</span>
                    <span>VERIFIED & AUTHENTIC — Token #{pdfResult.tokenId}</span>
                  </div>
                  <p className="text-xs text-green-300">
                    This PDF matches the blockchain state for <strong>{pdfResult.cert?.studentName}</strong> ({pdfResult.cert?.courseName}) exactly, and is in good standing.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
                    <span className="text-lg">❌</span>
                    <span>TAMPERED OR INVALID</span>
                  </div>
                  <p className="text-xs text-red-300">
                    The cryptographic digest inside this PDF does not match the on-chain certificate record for Token #{pdfResult.tokenId}.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* QUERY RESULTS */}
        {hasSearched && !isAddressQuery && !isNumericQuery && !isBytes32Query && (
          <div className="card p-4 text-center border-red-500/40 text-red-400">
            ❌ Please enter a valid 42-character Ethereum address (0x...) or a numerical Token ID (e.g. 1).
          </div>
        )}

        {isSearching && (
          <div className="card p-6 text-center text-muted">
            Querying Ethereum blockchain records...
          </div>
        )}

        {/* 1. SINGLE TOKEN ID RESULT */}
        {hasSearched && isNumericQuery && !isSearching && singleCert && (
          <div>
            <div
              className="card p-4 mb-4 font-semibold text-center rounded-lg"
              style={{
                borderColor: singleRevoked ? '#dc2626' : '#22c55e',
                color: singleRevoked ? '#ef4444' : '#4ade80',
                backgroundColor: singleRevoked ? 'rgba(220, 38, 38, 0.08)' : 'rgba(34, 197, 94, 0.08)',
              }}
            >
              {singleRevoked ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">⛔</span> <strong>REVOKED CREDENTIAL FOUND</strong> — Token #{trimmedQuery} has been revoked on-chain
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">✅</span> <strong>VERIFIED ON-CHAIN</strong> — Token #{trimmedQuery} is authentic and valid
                </span>
              )}
            </div>

            <VerifierCardItem
              cert={singleCert}
              tokenId={trimmedQuery}
              isRevoked={Boolean(singleRevoked)}
              ownerAddress={singleOwner}
              onViewExplorer={() => openExplorer(trimmedQuery)}
            />
          </div>
        )}

        {hasSearched && isNumericQuery && !isSearching && !singleCert && (
          <div className="card p-6 text-center text-yellow-400 border-yellow-500/30">
            ⚠️ No certificate found for Token ID #{trimmedQuery}. It may not have been minted yet.
          </div>
        )}

        {/* 2. WALLET ADDRESS RESULTS */}
        {hasSearched && isAddressQuery && !isSearching && ownedTokenIds.length === 0 && (
          <div className="card p-6 text-center text-yellow-400 border-yellow-500/30">
            ⚠️ UNVERIFIED — No SmartCert credentials found associated with address <span className="font-mono text-xs">{trimmedQuery}</span>.
          </div>
        )}

        {hasSearched && isAddressQuery && !isSearching && ownedTokenIds.length > 0 && (
          <div>
            <div
              className="card p-4 mb-4 font-semibold text-center rounded-lg"
              style={{ borderColor: '#22c55e', color: '#4ade80', backgroundColor: 'rgba(34, 197, 94, 0.08)' }}
            >
              ✅ VERIFIED — Found {ownedTokenIds.length} certificate(s) for this wallet
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {addressCertificates?.map((res, idx) => {
                const cert = res.result
                if (!cert) return null
                const tokenId = ownedTokenIds[idx]
                const isRevoked = Boolean(addressRevokedResults?.[idx]?.result)
                return (
                  <VerifierCardItem
                    key={tokenId}
                    cert={cert}
                    tokenId={tokenId}
                    isRevoked={isRevoked}
                    ownerAddress={trimmedQuery}
                    onViewExplorer={() => openExplorer(tokenId)}
                  />
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
