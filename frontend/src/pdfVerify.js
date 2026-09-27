import * as pdfjsLib from 'pdfjs-dist'
import { buildCertHashInput, sha256Hex } from './pdfCert'

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

// Extracts all text content from a PDF file
async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let fullText = ''
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    fullText += content.items.map((item) => item.str).join(' ') + '\n'
  }
  return fullText
}

// Returns { tokenId, embeddedHash } parsed from the PDF's footer text
export async function parseCertPDF(file) {
  const text = await extractTextFromPDF(file)

  const tokenMatch = text.match(/SMARTCERT-TOKEN-ID:(\d+)/)
  const hashMatch = text.match(/SMARTCERT-HASH:([a-f0-9]{64})/)

  if (!tokenMatch || !hashMatch) {
    throw new Error('This does not look like a valid SmartCert PDF (missing verification data).')
  }

  return {
    tokenId: tokenMatch[1],
    embeddedHash: hashMatch[1],
  }
}

// Compares a PDF's embedded hash against the certificate's actual on-chain data
export async function verifyCertPDF(file, onChainCert) {
  const { tokenId, embeddedHash } = await parseCertPDF(file)

  const expectedInput = buildCertHashInput(onChainCert, tokenId)
  const expectedHash = await sha256Hex(expectedInput)

  return {
    tokenId,
    isMatch: expectedHash === embeddedHash,
  }
}