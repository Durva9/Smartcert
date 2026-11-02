import { forwardRef } from 'react'

export const CERTIFICATE_TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic Academic',
    subtitle: 'Traditional University Diploma',
    description: 'Ivory parchment tone, double ornate borders, serif typography, and formal university seal.',
    defaultColor: '#b45309',
    badge: '🏛️ Academic',
    fontFamily: 'Georgia, "Times New Roman", serif',
  },
  {
    id: 'modern',
    name: 'Modern Tech',
    subtitle: 'Contemporary Tech Credential',
    description: 'Cyber dark aesthetic with glowing neon indigo & cyan accents, sans-serif type, and digital seal.',
    defaultColor: '#06b6d4',
    badge: '⚡ Tech',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  {
    id: 'executive',
    name: 'Executive Minimal',
    subtitle: 'Distinguished Leadership Award',
    description: 'Ultra-clean layout, gold & slate hairline accents, spacious minimalism, and formal executive signature block.',
    defaultColor: '#d97706',
    badge: '👑 Executive',
    fontFamily: 'Georgia, Cambria, serif',
  },
  {
    id: 'corporate',
    name: 'Corporate Achievement',
    subtitle: 'Professional Enterprise Standard',
    description: 'Bold ribbon banner header, dual corporate signatories, and professional certificate badges.',
    defaultColor: '#2563eb',
    badge: '🛡️ Enterprise',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
]

export const BORDER_STYLES = [
  { id: 'double-solid', name: 'Double Solid' },
  { id: 'gold-leaf', name: 'Gold Leaf Frame' },
  { id: 'minimalist', name: 'Minimalist Line' },
  { id: 'geometric', name: 'Geometric Tech' },
]

export const SEAL_PLACEMENTS = [
  { id: 'bottom-right', name: 'Bottom Right' },
  { id: 'bottom-center', name: 'Bottom Center' },
  { id: 'center-watermark', name: 'Center Watermark' },
  { id: 'top-right', name: 'Top Right' },
]

export const BADGE_ICONS = [
  { id: 'crest', label: '🏛️ University Crest', icon: '🏛️' },
  { id: 'tech', label: '⚡ Tech Poly', icon: '⚡' },
  { id: 'crown', label: '👑 Executive Crown', icon: '👑' },
  { id: 'shield', label: '🛡️ Corporate Shield', icon: '🛡️' },
  { id: 'laurel', label: '🌿 Academic Laurel', icon: '🌿' },
  { id: 'star', label: '⭐ Excellence Star', icon: '⭐' },
]

export const COLOR_PALETTES = [
  { id: 'gold', name: 'Imperial Gold', hex: '#b45309' },
  { id: 'cyan', name: 'Cyber Cyan', hex: '#06b6d4' },
  { id: 'navy', name: 'Royal Navy', hex: '#1e3a8a' },
  { id: 'emerald', name: 'Deep Emerald', hex: '#059669' },
  { id: 'ruby', name: 'Crimson Ruby', hex: '#b91c1c' },
  { id: 'purple', name: 'Obsidian Purple', hex: '#7c3aed' },
]

// Visual SVG QR Code representation
function MiniQRCode({ text, size = 64 }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        padding: '4px',
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        border: '1px solid rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
      }}
      title={`Verify at: ${text}`}
    >
      <svg width={size - 8} height={size - 8} viewBox="0 0 29 29" fill="none">
        <rect width="29" height="29" fill="white" />
        {/* QR Position Squares */}
        <rect x="2" y="2" width="7" height="7" fill="#111827" />
        <rect x="3" y="3" width="5" height="5" fill="white" />
        <rect x="4" y="4" width="3" height="3" fill="#111827" />

        <rect x="20" y="2" width="7" height="7" fill="#111827" />
        <rect x="21" y="3" width="5" height="5" fill="white" />
        <rect x="22" y="4" width="3" height="3" fill="#111827" />

        <rect x="2" y="20" width="7" height="7" fill="#111827" />
        <rect x="3" y="21" width="5" height="5" fill="white" />
        <rect x="4" y="22" width="3" height="3" fill="#111827" />

        {/* QR Data Pattern */}
        <rect x="11" y="3" width="2" height="2" fill="#111827" />
        <rect x="15" y="3" width="2" height="2" fill="#111827" />
        <rect x="11" y="7" width="2" height="2" fill="#111827" />
        <rect x="14" y="6" width="3" height="2" fill="#111827" />

        <rect x="4" y="11" width="2" height="3" fill="#111827" />
        <rect x="8" y="12" width="2" height="2" fill="#111827" />
        <rect x="12" y="11" width="5" height="2" fill="#111827" />
        <rect x="18" y="11" width="2" height="4" fill="#111827" />
        <rect x="22" y="12" width="4" height="2" fill="#111827" />

        <rect x="11" y="15" width="3" height="3" fill="#111827" />
        <rect x="16" y="15" width="2" height="2" fill="#111827" />
        <rect x="22" y="16" width="3" height="2" fill="#111827" />

        <rect x="11" y="20" width="2" height="4" fill="#111827" />
        <rect x="14" y="22" width="4" height="2" fill="#111827" />
        <rect x="20" y="20" width="2" height="2" fill="#111827" />
        <rect x="24" y="22" width="3" height="3" fill="#111827" />
      </svg>
    </div>
  )
}

const CertificateCard = forwardRef(function CertificateCard(
  { cert, tokenId, metadata, template = 'classic', isRevoked = false, scale = 1 },
  ref
) {
  // Extract configuration parameters from props or metadata
  const chosenTemplate = metadata?.templateId || template || 'classic'
  const custom = metadata?.customization || {}
  const academic = metadata?.academicData || {}

  const studentName = academic.studentName || cert?.studentName || 'Student Name'
  const courseName = academic.courseName || cert?.courseName || 'Course Title'
  const track = academic.specializationTrack || ''
  const grade = academic.gradeDistinction || ''
  const credits = academic.creditHours || ''
  const issueDate = academic.issueDate || cert?.issueDate || '—'
  const expiryDate = academic.expiryDate || ''
  const signatoryName = academic.signatoryName || ''
  const signatoryTitle = academic.signatoryTitle || ''
  const coSignatoryName = academic.coSignatoryName || ''
  const coSignatoryTitle = academic.coSignatoryTitle || ''

  const primaryColor = custom.primaryColor || (chosenTemplate === 'modern' ? '#06b6d4' : chosenTemplate === 'corporate' ? '#2563eb' : chosenTemplate === 'executive' ? '#d97706' : '#b45309')
  const borderStyle = custom.borderStyle || 'double-solid'
  const sealPlacement = custom.sealPlacement || 'bottom-right'
  const badgeIcon = custom.badgeIcon || (chosenTemplate === 'modern' ? '⚡' : chosenTemplate === 'corporate' ? '🛡️' : chosenTemplate === 'executive' ? '👑' : '🏛️')
  const logoUrl = custom.logoUrl || null

  // Base theme definitions
  const getTheme = () => {
    switch (chosenTemplate) {
      case 'modern':
        return {
          background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
          color: '#f8fafc',
          headerColor: '#94a3b8',
          subColor: '#cbd5e1',
          nameColor: primaryColor,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          sealBg: 'rgba(6, 182, 212, 0.15)',
          sealBorder: primaryColor,
          boxShadow: `0 0 30px rgba(6, 182, 212, 0.2), inset 0 0 40px rgba(15, 23, 42, 0.6)`,
        }
      case 'executive':
        return {
          background: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 50%, #ffffff 100%)',
          color: '#1c1917',
          headerColor: '#57534e',
          subColor: '#292524',
          nameColor: '#1c1917',
          fontFamily: 'Georgia, Cambria, serif',
          sealBg: 'rgba(217, 119, 6, 0.1)',
          sealBorder: '#d97706',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.08), inset 0 0 60px rgba(217, 119, 6, 0.03)',
        }
      case 'corporate':
        return {
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 60%, #f1f5f9 100%)',
          color: '#0f172a',
          headerColor: '#475569',
          subColor: '#1e293b',
          nameColor: primaryColor,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          sealBg: 'rgba(37, 99, 235, 0.1)',
          sealBorder: primaryColor,
          boxShadow: '0 10px 30px rgba(37, 99, 235, 0.1)',
        }
      case 'classic':
      default:
        return {
          background: 'linear-gradient(135deg, #fffbf2 0%, #fdf6e7 50%, #fefcf6 100%)',
          color: '#1f2937',
          headerColor: '#4b5563',
          subColor: '#374151',
          nameColor: primaryColor,
          fontFamily: 'Georgia, "Times New Roman", serif',
          sealBg: 'rgba(180, 83, 9, 0.12)',
          sealBorder: primaryColor,
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.1), inset 0 0 50px rgba(180, 83, 9, 0.06)',
        }
    }
  }

  const theme = getTheme()

  // Compute outer and inner border CSS based on borderStyle
  const getBorderStyles = () => {
    switch (borderStyle) {
      case 'gold-leaf':
        return {
          outer: `8px solid ${primaryColor}`,
          inner: `2px dashed rgba(217, 119, 6, 0.6)`,
          borderRadius: '4px',
        }
      case 'minimalist':
        return {
          outer: `2px solid ${primaryColor}`,
          inner: `1px solid rgba(0, 0, 0, 0.08)`,
          borderRadius: '2px',
        }
      case 'geometric':
        return {
          outer: `4px solid ${primaryColor}`,
          inner: `2px solid ${primaryColor}44`,
          borderRadius: '16px',
        }
      case 'double-solid':
      default:
        return {
          outer: `6px double ${primaryColor}`,
          inner: `1px solid ${primaryColor}55`,
          borderRadius: '0px',
        }
    }
  }

  const border = getBorderStyles()

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: '840px',
        minHeight: '560px',
        padding: '20px',
        background: theme.background,
        color: theme.color,
        border: border.outer,
        borderRadius: border.borderRadius,
        boxShadow: theme.boxShadow,
        fontFamily: theme.fontFamily,
        boxSizing: 'border-box',
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top left',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* Decorative Inner Mat / Inset */}
      <div
        style={{
          border: border.inner,
          padding: '28px 36px',
          minHeight: '516px',
          boxSizing: 'border-box',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* REVOKED STAMP & WATERMARK */}
        {isRevoked && (
          <>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: '#dc2626',
                color: '#ffffff',
                fontWeight: 'bold',
                padding: '7px 16px',
                fontSize: '11px',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                zIndex: 25,
                boxShadow: '0 4px 15px rgba(220, 38, 38, 0.6)',
              }}
            >
              ⛔ OFFICIAL NOTICE: THIS CREDENTIAL HAS BEEN REVOKED BY THE INSTITUTION
            </div>

            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) rotate(-18deg)',
                border: '8px solid #dc2626',
                color: '#dc2626',
                padding: '16px 48px',
                fontSize: '52px',
                fontWeight: '900',
                letterSpacing: '10px',
                textTransform: 'uppercase',
                borderRadius: '8px',
                backgroundColor: 'rgba(254, 226, 226, 0.94)',
                boxShadow: '0 0 50px rgba(220, 38, 38, 0.7)',
                zIndex: 35,
                pointerEvents: 'none',
              }}
            >
              REVOKED
            </div>
          </>
        )}

        {/* Center Watermark placement */}
        {sealPlacement === 'center-watermark' && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '180px',
              opacity: 0.05,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {badgeIcon}
          </div>
        )}

        {/* TOP HEADER SECTION */}
        <div style={{ marginTop: isRevoked ? '24px' : '0', zIndex: 2 }}>
          {/* Institution Crest / Logo / Top Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Institution Logo" style={{ height: '48px', objectFit: 'contain' }} />
            ) : (
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  border: `2px solid ${primaryColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  backgroundColor: theme.sealBg,
                }}
              >
                {badgeIcon}
              </div>
            )}
            <div style={{ textAlign: 'left' }}>
              <span
                style={{
                  fontSize: '11px',
                  letterSpacing: '2px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  color: primaryColor,
                  display: 'block',
                }}
              >
                SMARTCERT ACADEMIC CONSORTIUM
              </span>
              <span style={{ fontSize: '10px', color: theme.headerColor, letterSpacing: '1px' }}>
                ON-CHAIN VERIFIED SOULBOUND CREDENTIAL • ERC-5192
              </span>
            </div>

            {/* Top-Right Seal Placement */}
            {sealPlacement === 'top-right' && (
              <div
                style={{
                  marginLeft: 'auto',
                  border: `2px solid ${primaryColor}`,
                  borderRadius: '50%',
                  width: '46px',
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  backgroundColor: theme.sealBg,
                }}
              >
                {badgeIcon}
              </div>
            )}
          </div>

          {/* Certificate Title */}
          <h1
            style={{
              fontSize: chosenTemplate === 'corporate' ? '28px' : '32px',
              fontWeight: '700',
              margin: '10px 0 4px',
              letterSpacing: chosenTemplate === 'executive' ? '3px' : '1px',
              textTransform: chosenTemplate === 'executive' || chosenTemplate === 'corporate' ? 'uppercase' : 'none',
              color: chosenTemplate === 'modern' ? '#ffffff' : primaryColor,
            }}
          >
            {chosenTemplate === 'corporate'
              ? 'Certificate of Professional Achievement'
              : chosenTemplate === 'executive'
              ? 'Executive Certificate of Distinction'
              : chosenTemplate === 'modern'
              ? 'Verified Competency Credential'
              : 'Certificate of Academic Completion'}
          </h1>

          <p style={{ fontSize: '13px', color: theme.headerColor, margin: '4px 0 0', fontStyle: 'italic' }}>
            This officially certifies that
          </p>
        </div>

        {/* STUDENT NAME */}
        <div style={{ margin: '14px 0', zIndex: 2 }}>
          <h2
            style={{
              fontSize: '34px',
              fontWeight: '800',
              color: theme.nameColor,
              margin: 0,
              letterSpacing: '0.5px',
              textShadow: chosenTemplate === 'modern' ? `0 0 16px ${primaryColor}66` : undefined,
            }}
          >
            {studentName}
          </h2>
          <div
            style={{
              width: '180px',
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
              margin: '8px auto 0',
            }}
          />
        </div>

        {/* PROGRAM, TRACK & METRICS */}
        <div style={{ zIndex: 2, margin: '4px 0 10px' }}>
          <p style={{ fontSize: '13px', color: theme.headerColor, margin: '0 0 4px' }}>
            has successfully fulfilled all institutional criteria and academic rigors for
          </p>
          <h3
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: theme.subColor,
              margin: '4px 0 6px',
            }}
          >
            {courseName}
          </h3>

          {track && (
            <p
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: primaryColor,
                margin: '2px 0 6px',
                letterSpacing: '0.5px',
              }}
            >
              Specialization Track: {track}
            </p>
          )}

          {/* Academic Badges (Grade / Credits) - Only rendered if provided */}
          {Boolean(grade || credits) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '6px' }}>
              {grade ? (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    border: `1px solid ${primaryColor}88`,
                    backgroundColor: theme.sealBg,
                    color: primaryColor,
                  }}
                >
                  ★ {grade}
                </span>
              ) : null}
              {credits ? (
                <span
                  style={{
                    fontSize: '11px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(120,120,120,0.2)',
                    color: theme.headerColor,
                  }}
                >
                  ⏱ {credits}
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* FOOTER & SIGNATURES SECTION */}
        <div
          style={{
            zIndex: 2,
            borderTop: `1px solid ${chosenTemplate === 'modern' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
            paddingTop: '16px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: theme.headerColor,
          }}
        >
          {/* Left: Verification QR Code & Token Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
            <MiniQRCode text={`SmartCert-Token-${tokenId || '0'}`} size={56} />
            <div>
              <p style={{ margin: '1px 0', fontWeight: '600', color: theme.color }}>
                Token ID: <span style={{ fontFamily: 'monospace' }}>#{tokenId || '1'}</span>
              </p>
              <p style={{ margin: '1px 0' }}>Issued: {issueDate}</p>
              {expiryDate ? (
                <p style={{ margin: '1px 0', fontSize: '10px' }}>Validity: {expiryDate}</p>
              ) : null}
            </div>
          </div>

          {/* Center Seal Placement (if selected) */}
          {sealPlacement === 'bottom-center' && (
            <div style={{ textAlign: 'center', margin: '0 8px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  border: `3px double ${primaryColor}`,
                  margin: '0 auto 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  backgroundColor: theme.sealBg,
                }}
              >
                {badgeIcon}
              </div>
              <span style={{ fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: primaryColor, fontWeight: 'bold' }}>
                OFFICIAL SEAL
              </span>
            </div>
          )}

          {/* Right: Signatory / Signatories */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', textAlign: 'center' }}>
            {/* Primary Signatory - Only if name provided */}
            {signatoryName ? (
              <div>
                <div
                  style={{
                    fontFamily: '"Brush Script MT", "Caveat", cursive, Georgia, serif',
                    fontSize: '20px',
                    color: primaryColor,
                    lineHeight: '1',
                    marginBottom: '2px',
                  }}
                >
                  {signatoryName}
                </div>
                <div style={{ width: '130px', height: '1px', backgroundColor: primaryColor, margin: '0 auto 3px' }} />
                <p style={{ margin: 0, fontWeight: '700', color: theme.color, fontSize: '11px' }}>{signatoryName}</p>
                {signatoryTitle ? (
                  <p style={{ margin: 0, fontSize: '10px', color: theme.headerColor }}>{signatoryTitle}</p>
                ) : null}
              </div>
            ) : null}

            {/* Corporate Template Dual Signatory - Only if co-signatory provided */}
            {chosenTemplate === 'corporate' && coSignatoryName ? (
              <div>
                <div
                  style={{
                    fontFamily: '"Brush Script MT", "Caveat", cursive, Georgia, serif',
                    fontSize: '20px',
                    color: primaryColor,
                    lineHeight: '1',
                    marginBottom: '2px',
                  }}
                >
                  {coSignatoryName}
                </div>
                <div style={{ width: '130px', height: '1px', backgroundColor: primaryColor, margin: '0 auto 3px' }} />
                <p style={{ margin: 0, fontWeight: '700', color: theme.color, fontSize: '11px' }}>{coSignatoryName}</p>
                {coSignatoryTitle ? (
                  <p style={{ margin: 0, fontSize: '10px', color: theme.headerColor }}>{coSignatoryTitle}</p>
                ) : null}
              </div>
            ) : null}

            {/* Bottom-Right Traditional Stamp */}
            {sealPlacement === 'bottom-right' && (
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  border: `2px dashed ${primaryColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  backgroundColor: theme.sealBg,
                }}
                title="Institutional Blockchain Notary"
              >
                {badgeIcon}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default CertificateCard
