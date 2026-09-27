import { forwardRef } from 'react'

const CertificateCard = forwardRef(function CertificateCard({ cert, tokenId }, ref) {
  return (
    <div
      ref={ref}
      style={{
        width: '800px',
        padding: '60px',
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)',
        border: '8px solid #4f46e5',
        fontFamily: 'Georgia, serif',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: '14px', color: '#6b7280', letterSpacing: '2px' }}>
        SMARTCERT — BLOCKCHAIN VERIFIED CREDENTIAL
      </p>
      <h1 style={{ fontSize: '36px', margin: '20px 0 10px', color: '#1f2937' }}>
        Certificate of Completion
      </h1>
      <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '30px' }}>
        This certifies that
      </p>
      <h2 style={{ fontSize: '32px', color: '#4f46e5', margin: '0 0 30px' }}>
        {cert.studentName}
      </h2>
      <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '10px' }}>
        has successfully completed
      </p>
      <h3 style={{ fontSize: '24px', color: '#1f2937', margin: '0 0 30px' }}>
        {cert.courseName}
      </h3>
      <p style={{ fontSize: '14px', color: '#6b7280' }}>
        Issued on {cert.issueDate} &nbsp;|&nbsp; Token ID #{tokenId}
      </p>
      <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '30px' }}>
        Verifiable on Ethereum Sepolia — Soulbound Token (ERC-5192)
      </p>
    </div>
  )
})

export default CertificateCard