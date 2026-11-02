import { useState, useEffect, useRef } from 'react'
import html2canvas from 'html2canvas'
import CertificateCard from './CertificateCard'
import { generateCertificatePDF } from './pdfCert'
import { fetchCertificateMetadata } from './ipfs'

function CertificateItem({ cert, tokenId, isRevoked = false, onViewEtherscan }) {
  const cardRef = useRef(null)
  const [metadata, setMetadata] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

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

  async function handleDownload() {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 2 })
    const link = document.createElement('a')
    link.download = `SmartCert-${cert.studentName.replace(/\s+/g, '_')}${isRevoked ? '-REVOKED' : ''}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  async function handleDownloadPDF() {
    await generateCertificatePDF(cert, tokenId, metadata, isRevoked)
  }

  return (
    <div
      className="rounded-lg p-4 transition-all"
      style={{
        border: `1px solid ${isRevoked ? '#ef4444' : 'var(--border)'}`,
        borderTopWidth: '4px',
        borderTopColor: isRevoked ? '#dc2626' : 'var(--accent)',
        backgroundColor: 'var(--bg)',
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-muted">Token ID #{tokenId}</p>
        {isRevoked ? (
          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-red-600 text-white flex items-center gap-1 animate-pulse">
            ⛔ REVOKED
          </span>
        ) : (
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20">
            ✓ Authentic & Locked
          </span>
        )}
      </div>

      <h3 className="font-display font-bold text-lg flex items-center gap-2">
        {cert.courseName}
      </h3>
      <p className="text-sm text-muted">
        Awarded to <span className="font-medium" style={{ color: 'var(--text)' }}>{cert.studentName}</span>
      </p>

      {academic.specializationTrack && (
        <p className="text-xs text-indigo-400 mt-0.5">
          Track: {academic.specializationTrack}
        </p>
      )}

      {academic.gradeDistinction && (
        <p className="text-xs text-amber-500/90 font-medium mt-0.5">
          Distinction: {academic.gradeDistinction}
        </p>
      )}

      <div className="flex items-center justify-between text-xs text-muted mt-2 pt-1 border-t border-neutral-800">
        <span>Issued: {cert.issueDate}</span>
        <span className="capitalize font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-800/40">
          Template: {templateId}
        </span>
      </div>

      {isRevoked && (
        <div className="mt-2.5 p-2 rounded text-xs bg-red-500/10 border border-red-500/30 text-red-400">
          ⚠️ This credential was revoked on-chain by the institution and is permanently invalid.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs px-2.5 py-1.5 rounded font-medium border cursor-pointer"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          {showPreview ? '✕ Hide Certificate' : '👁️ View Certificate'}
        </button>

        <button
          onClick={handleDownload}
          className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 font-medium cursor-pointer"
        >
          Download PNG
        </button>

        <button
          onClick={handleDownloadPDF}
          className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded hover:bg-teal-700 font-medium cursor-pointer"
        >
          Download PDF
        </button>

        <button
          onClick={onViewEtherscan}
          className="text-xs underline bg-transparent border-none cursor-pointer p-0 ml-auto"
          style={{ color: 'var(--accent)' }}
        >
          Explorer ↗
        </button>
      </div>

      {/* Inline Rendered Certificate Card */}
      {showPreview && (
        <div className="mt-4 p-2 rounded overflow-x-auto bg-neutral-900/40 border border-neutral-800 flex justify-center">
          <div style={{ transform: 'scale(0.70)', transformOrigin: 'top center', marginBottom: '-160px' }}>
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

      {/* Hidden card container for html2canvas full-resolution capture */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <CertificateCard
          ref={cardRef}
          cert={cert}
          tokenId={tokenId}
          metadata={metadata}
          template={templateId}
          isRevoked={isRevoked}
        />
      </div>
    </div>
  )
}

export default CertificateItem
