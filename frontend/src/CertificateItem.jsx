import { useRef } from 'react'
import html2canvas from 'html2canvas'
import CertificateCard from './CertificateCard'
import { generateCertificatePDF } from './pdfCert'

function CertificateItem({ cert, tokenId, onViewEtherscan }) {
  const cardRef = useRef(null)

  async function handleDownload() {
    if (!cardRef.current) return
    const canvas = await html2canvas(cardRef.current, { scale: 2 })
    const link = document.createElement('a')
    link.download = `SmartCert-${cert.studentName.replace(/\s+/g, '_')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  async function handleDownloadPDF() {
    await generateCertificatePDF(cert, tokenId)
  }

  return (
    <div
      className="rounded-lg p-4"
      style={{ borderTop: '4px solid var(--accent)', border: '1px solid var(--border)', borderTopWidth: '4px', backgroundColor: 'var(--bg)' }}
    >
      <p className="text-xs text-muted mb-1">Token ID #{tokenId}</p>
      <h3 className="font-display font-bold text-lg">{cert.courseName}</h3>
      <p className="text-sm text-muted">
        Awarded to <span className="font-medium" style={{ color: 'var(--text)' }}>{cert.studentName}</span>
      </p>
      <p className="text-sm text-muted">Issued: {cert.issueDate}</p>

      <div className="flex flex-wrap gap-2 mt-2">
        <button
          onClick={onViewEtherscan}
          className="text-xs underline bg-transparent border-none cursor-pointer p-0"
          style={{ color: 'var(--accent)' }}
        >
          View on Etherscan
        </button>
        <button
          onClick={handleDownload}
          className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700"
        >
          Download PNG
        </button>
        <button
          onClick={handleDownloadPDF}
          className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded hover:bg-teal-700"
        >
          Download PDF
        </button>
      </div>

      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <CertificateCard ref={cardRef} cert={cert} tokenId={tokenId} />
      </div>
    </div>
  )
}

export default CertificateItem