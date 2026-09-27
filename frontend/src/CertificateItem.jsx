import { useRef } from 'react'
import html2canvas from 'html2canvas'
import CertificateCard from './CertificateCard'

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

  return (
    <div className="border-t-4 border-blue-600 rounded-lg shadow p-4">
      <p className="text-xs text-gray-400 mb-1">Token ID #{tokenId}</p>
      <h3 className="font-bold text-lg">{cert.courseName}</h3>
      <p className="text-sm text-gray-600">
        Awarded to <span className="font-medium">{cert.studentName}</span>
      </p>
      <p className="text-sm text-gray-600">Issued: {cert.issueDate}</p>

      <div className="flex flex-wrap gap-2 mt-2">
        <button
          onClick={onViewEtherscan}
          className="text-xs text-blue-600 underline bg-transparent border-none cursor-pointer p-0"
        >
          View on Etherscan
        </button>
        <button
          onClick={handleDownload}
          className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700"
        >
          Download Certificate
        </button>
      </div>

      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <CertificateCard ref={cardRef} cert={cert} tokenId={tokenId} />
      </div>
    </div>
  )
}

export default CertificateItem