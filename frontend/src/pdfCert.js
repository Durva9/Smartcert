import jsPDF from 'jspdf'

// Creates a deterministic string from the certificate's core data
export function buildCertHashInput(cert, tokenId) {
  return `${tokenId}|${cert.studentName}|${cert.courseName}|${cert.issueDate}`
}

// Computes a SHA-256 hash (hex string) using the browser's built-in crypto API
export async function sha256Hex(text) {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function generateCertificatePDF(cert, tokenId) {
  const hashInput = buildCertHashInput(cert, tokenId)
  const hash = await sha256Hex(hashInput)

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setDrawColor(79, 70, 229)
  doc.setLineWidth(4)
  doc.rect(20, 20, pageWidth - 40, doc.internal.pageSize.getHeight() - 40)

  doc.setFont('times', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(100)
  doc.text('SMARTCERT — BLOCKCHAIN VERIFIED CREDENTIAL', pageWidth / 2, 80, { align: 'center' })

  doc.setFontSize(28)
  doc.setTextColor(30)
  doc.text('Certificate of Completion', pageWidth / 2, 130, { align: 'center' })

  doc.setFontSize(14)
  doc.setTextColor(100)
  doc.text('This certifies that', pageWidth / 2, 180, { align: 'center' })

  doc.setFontSize(26)
  doc.setTextColor(79, 70, 229)
  doc.text(cert.studentName, pageWidth / 2, 220, { align: 'center' })

  doc.setFontSize(14)
  doc.setTextColor(100)
  doc.text('has successfully completed', pageWidth / 2, 260, { align: 'center' })

  doc.setFontSize(20)
  doc.setTextColor(30)
  doc.text(cert.courseName, pageWidth / 2, 300, { align: 'center' })

  doc.setFontSize(11)
  doc.setTextColor(100)
  doc.text(`Issued on ${cert.issueDate}  |  Token ID #${tokenId}`, pageWidth / 2, 350, { align: 'center' })

  // Machine-readable footer used by the Verifier Portal's PDF checker
  doc.setFontSize(8)
  doc.setTextColor(180)
  doc.text(`SMARTCERT-TOKEN-ID:${tokenId}`, pageWidth / 2, 400, { align: 'center' })
  doc.text(`SMARTCERT-HASH:${hash}`, pageWidth / 2, 415, { align: 'center' })

  doc.save(`SmartCert-${cert.studentName.replace(/\s+/g, '_')}.pdf`)
}