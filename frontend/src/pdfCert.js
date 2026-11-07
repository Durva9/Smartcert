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

export async function generateCertificatePDF(cert, tokenId, templateOrMeta = 'classic', isRevoked = false) {
  const hashInput = buildCertHashInput(cert, tokenId)
  const hash = await sha256Hex(hashInput)

  const meta = typeof templateOrMeta === 'object' && templateOrMeta !== null ? templateOrMeta : null
  const templateId = meta?.templateId || (typeof templateOrMeta === 'string' ? templateOrMeta : 'classic')
  const academic = meta?.academicData || {}

  const studentName = academic.studentName || cert.studentName
  const courseName = academic.courseName || cert.courseName
  const track = academic.specializationTrack || ''
  const grade = academic.gradeDistinction || ''
  const credits = academic.creditHours || ''
  const signatoryName = academic.signatoryName || ''
  const signatoryTitle = academic.signatoryTitle || ''

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Styling based on template
  let primaryColor = [180, 83, 9] // default gold/brown
  let titleColor = [30, 58, 138] // Navy
  let titleText = 'Certificate of Academic Completion'

  if (templateId === 'modern') {
    primaryColor = [6, 182, 212] // Cyan
    titleColor = [99, 102, 241] // Indigo
    titleText = 'Verified Competency Credential'
  } else if (templateId === 'executive') {
    primaryColor = [217, 119, 6] // Gold
    titleColor = [6, 78, 59] // Emerald
    titleText = 'Executive Certificate of Distinction'
  } else if (templateId === 'corporate') {
    primaryColor = [37, 99, 235] // Blue
    titleColor = [15, 23, 42] // Slate
    titleText = 'Certificate of Professional Achievement'
  }

  const customTitle = metadata?.customization?.certificateTitle || metadata?.academicData?.certificateTitle
  if (customTitle) {
    titleText = customTitle
  }

  // Outer border
  doc.setDrawColor(...primaryColor)
  doc.setLineWidth(4)
  doc.rect(20, 20, pageWidth - 40, pageHeight - 40)

  // Inner border
  doc.setLineWidth(1)
  doc.rect(26, 26, pageWidth - 52, pageHeight - 52)

  // Revocation banner if revoked
  if (isRevoked) {
    doc.setFillColor(220, 38, 38)
    doc.rect(26, 26, pageWidth - 52, 28, 'F')
    doc.setFont('times', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(255, 255, 255)
    doc.text('OFFICIAL NOTICE: THIS CERTIFICATE HAS BEEN REVOKED BY THE ISSUER', pageWidth / 2, 44, { align: 'center' })

    // Diagonal watermark
    doc.setFontSize(44)
    doc.setTextColor(239, 68, 68)
    doc.text('REVOKED', pageWidth / 2, pageHeight / 2 + 10, {
      align: 'center',
      angle: -20,
    })
  }

  doc.setFont('times', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(120)
  doc.text(`SMARTCERT — BLOCKCHAIN VERIFIED CREDENTIAL (ERC-5192) • ${templateId.toUpperCase()} TEMPLATE`, pageWidth / 2, isRevoked ? 82 : 72, { align: 'center' })

  doc.setFontSize(26)
  doc.setTextColor(...titleColor)
  doc.text(titleText, pageWidth / 2, 116, { align: 'center' })

  doc.setFontSize(13)
  doc.setTextColor(110)
  doc.text('This certifies that', pageWidth / 2, 160, { align: 'center' })

  doc.setFontSize(28)
  doc.setTextColor(...primaryColor)
  doc.text(studentName, pageWidth / 2, 202, { align: 'center' })

  doc.setFontSize(13)
  doc.setTextColor(110)
  doc.text('has successfully completed the curriculum and institutional requirements for', pageWidth / 2, 242, { align: 'center' })

  doc.setFontSize(22)
  doc.setTextColor(30, 41, 59)
  doc.text(courseName, pageWidth / 2, 278, { align: 'center' })

  if (track) {
    doc.setFontSize(12)
    doc.setTextColor(...primaryColor)
    doc.text(`Specialization: ${track}`, pageWidth / 2, 304, { align: 'center' })
  }

  let extraMetrics = []
  if (grade) extraMetrics.push(`Distinction: ${grade}`)
  if (credits) extraMetrics.push(`Credits: ${credits}`)
  if (extraMetrics.length > 0) {
    doc.setFontSize(11)
    doc.setTextColor(100)
    doc.text(extraMetrics.join('   |   '), pageWidth / 2, track ? 324 : 312, { align: 'center' })
  }

  doc.setFontSize(10)
  doc.setTextColor(110)
  doc.text(`Issued on ${cert.issueDate}   |   Token ID #${tokenId}   |   Status: ${isRevoked ? 'REVOKED' : 'VALID'}`, pageWidth / 2, 360, { align: 'center' })

  // Signatory line - only drawn if provided
  if (signatoryName) {
    doc.setFontSize(11)
    doc.setTextColor(30)
    doc.text(signatoryTitle ? `Signed: ${signatoryName} (${signatoryTitle})` : `Signed: ${signatoryName}`, pageWidth / 2, 396, { align: 'center' })
  }

  // Machine-readable footer used by the Verifier Portal's PDF checker
  doc.setFontSize(8)
  doc.setTextColor(180)
  doc.text(`SMARTCERT-TOKEN-ID:${tokenId}`, pageWidth / 2, 420, { align: 'center' })
  doc.text(`SMARTCERT-HASH:${hash}`, pageWidth / 2, 432, { align: 'center' })
  doc.text(`SMARTCERT-TEMPLATE:${templateId}`, pageWidth / 2, 444, { align: 'center' })

  doc.save(`SmartCert-${studentName.replace(/\s+/g, '_')}${isRevoked ? '-REVOKED' : ''}.pdf`)
}
