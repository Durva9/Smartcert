import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi'
import { hardhat } from 'wagmi/chains'
import { pad, toHex, isHex } from 'viem'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract'
import { uploadMetadataToIPFS } from './ipfs'
import CertificateCard, {
  CERTIFICATE_TEMPLATES,
  BORDER_STYLES,
  SEAL_PLACEMENTS,
  BADGE_ICONS,
  COLOR_PALETTES,
} from './CertificateCard'
import Papa from 'papaparse'

function IssuerPortal() {
  // 1. Template & Customization State
  const [selectedTemplate, setSelectedTemplate] = useState('classic')
  const [primaryColor, setPrimaryColor] = useState('#b45309')
  const [borderStyle, setBorderStyle] = useState('double-solid')
  const [sealPlacement, setSealPlacement] = useState('bottom-right')
  const [badgeIcon, setBadgeIcon] = useState('🏛️')
  const [customLogoUrl, setCustomLogoUrl] = useState('')
  const [showLivePreview, setShowLivePreview] = useState(true)

  // 2. Expanded Institutional Certificate Details
  const [studentAddress, setStudentAddress] = useState('')
  const [studentName, setStudentName] = useState('')
  const [courseName, setCourseName] = useState('')
  const [specializationTrack, setSpecializationTrack] = useState('')
  const [gradeDistinction, setGradeDistinction] = useState('')
  const [creditHours, setCreditHours] = useState('')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [expiryDate, setExpiryDate] = useState('')
  const [signatoryName, setSignatoryName] = useState('')
  const [signatoryTitle, setSignatoryTitle] = useState('')
  const [coSignatoryName, setCoSignatoryName] = useState('')
  const [coSignatoryTitle, setCoSignatoryTitle] = useState('')

  // Status & Batch states
  const [status, setStatus] = useState('')
  const [csvFile, setCsvFile] = useState(null)
  const [batchStatus, setBatchStatus] = useState('')

  // Revocation state
  const [revokeCertId, setRevokeCertId] = useState('')
  const [revokeConfirm, setRevokeConfirm] = useState(false)
  const [revokeStatus, setRevokeStatus] = useState('')

  // Contract write hooks for issuance
  const {
    writeContract: writeIssue,
    data: issueHash,
    isPending: isIssuePending,
    error: issueError,
  } = useWriteContract()

  const { isLoading: isIssueConfirming, isSuccess: isIssueSuccess } =
    useWaitForTransactionReceipt({ hash: issueHash })

  // Contract write hooks for revocation
  const {
    writeContract: writeRevoke,
    data: revokeHash,
    isPending: isRevokePending,
    error: revokeWriteError,
  } = useWriteContract()

  const { isLoading: isRevokeConfirming, isSuccess: isRevokeSuccess } =
    useWaitForTransactionReceipt({ hash: revokeHash })

  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // Synchronize default color on template change if unmodified
  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId)
    const t = CERTIFICATE_TEMPLATES.find((x) => x.id === templateId)
    if (t) {
      setPrimaryColor(t.defaultColor)
      if (templateId === 'modern') {
        setBorderStyle('geometric')
        setBadgeIcon('⚡')
      } else if (templateId === 'executive') {
        setBorderStyle('gold-leaf')
        setBadgeIcon('👑')
      } else if (templateId === 'corporate') {
        setBorderStyle('double-solid')
        setBadgeIcon('🛡️')
      } else {
        setBorderStyle('double-solid')
        setBadgeIcon('🏛️')
      }
    }
  }

  // Handle Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (uploadEvent) => {
        setCustomLogoUrl(uploadEvent.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Single Certificate Issuance
  async function handleSubmit(e) {
    e.preventDefault()

    if (chainId !== hardhat.id) {
      setStatus('⚠️ Wrong network detected! Please switch MetaMask to Hardhat Localhost (Chain 31337).')
      switchChain?.({ chainId: hardhat.id })
      return
    }

    setStatus('Assembling rich institutional metadata & pinning to IPFS...')

    try {
      const metadata = {
        name: `${courseName} Certificate`,
        description: `Official Academic Credential awarded to ${studentName} for completion of ${courseName}`,
        templateId: selectedTemplate,
        customization: {
          primaryColor,
          borderStyle,
          sealPlacement,
          badgeIcon,
          logoUrl: customLogoUrl || null,
        },
        academicData: {
          studentName,
          courseName,
          specializationTrack,
          gradeDistinction,
          creditHours,
          issueDate,
          expiryDate,
          signatoryName,
          signatoryTitle,
          coSignatoryName,
          coSignatoryTitle,
        },
        attributes: [
          { trait_type: 'Student Name', value: studentName },
          { trait_type: 'Course', value: courseName },
          ...(specializationTrack ? [{ trait_type: 'Specialization Track', value: specializationTrack }] : []),
          ...(gradeDistinction ? [{ trait_type: 'Grade Distinction', value: gradeDistinction }] : []),
          ...(creditHours ? [{ trait_type: 'Credit Hours', value: creditHours }] : []),
          { trait_type: 'Issue Date', value: issueDate },
          ...(expiryDate ? [{ trait_type: 'Expiration Date', value: expiryDate }] : []),
          { trait_type: 'Signatory', value: `${signatoryName} (${signatoryTitle})` },
          { trait_type: 'Template', value: selectedTemplate },
          { trait_type: 'Border Style', value: borderStyle },
        ],
      }

      const tokenURI = await uploadMetadataToIPFS(metadata)
      setStatus('Metadata pinned. Awaiting MetaMask signature to mint on-chain...')

      writeIssue({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'issueCertificate',
        args: [studentAddress.trim(), studentName, courseName, issueDate, tokenURI],
      })
    } catch (err) {
      console.error(err)
      setStatus('Error: ' + err.message)
    }
  }

  // Batch Certificate Issuance (CSV)
  async function handleBatchSubmit(e) {
    e.preventDefault()
    if (!csvFile) return

    setBatchStatus('Parsing CSV batch records...')

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().replace(/^\uFEFF/, ''),
      complete: async (results) => {
        try {
          const rows = results.data
          setBatchStatus(`Generating & pinning metadata for ${rows.length} certificates...`)

          const uris = []
          for (const row of rows) {
            const metadata = {
              name: `${row.course} Certificate`,
              description: `Awarded to ${row.name} for completing ${row.course}`,
              templateId: selectedTemplate,
              customization: {
                primaryColor,
                borderStyle,
                sealPlacement,
                badgeIcon,
              },
              academicData: {
                studentName: row.name,
                courseName: row.course,
                specializationTrack: row.track || specializationTrack,
                gradeDistinction: row.grade || gradeDistinction,
                creditHours: row.credits || creditHours,
                issueDate: row.issue_date || issueDate,
                expiryDate: 'Lifetime / No Expiration',
                signatoryName,
                signatoryTitle,
              },
              attributes: [
                { trait_type: 'Student Name', value: row.name },
                { trait_type: 'Course', value: row.course },
                { trait_type: 'Issue Date', value: row.issue_date || issueDate },
                { trait_type: 'Template', value: selectedTemplate },
              ],
            }
            const uri = await uploadMetadataToIPFS(metadata)
            uris.push(uri)
          }

          setBatchStatus('Submitting batch issuance transaction to Hardhat node...')

          writeIssue({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'batchIssueCertificates',
            args: [
              rows.map((r) => (r.wallet || '').trim()),
              rows.map((r) => r.name),
              rows.map((r) => r.course),
              rows.map((r) => r.issue_date || issueDate),
              uris,
            ],
          })
        } catch (err) {
          console.error(err)
          setBatchStatus('Error: ' + err.message)
        }
      },
    })
  }

  // Revocation Handler
  function handleRevokeSubmit(e) {
    e.preventDefault()
    const input = revokeCertId.trim()
    if (!input) return

    if (chainId !== hardhat.id) {
      setRevokeStatus('⚠️ Wrong network detected! Please switch MetaMask to Hardhat Localhost (Chain 31337).')
      switchChain?.({ chainId: hardhat.id })
      return
    }

    setRevokeStatus('Submitting permanent revocation to Hardhat node...')

    try {
      if (isHex(input)) {
        const formattedBytes32 = input.length === 66 ? input : pad(input, { size: 32 })
        writeRevoke({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'revokeCertificate',
          args: [formattedBytes32],
        })
      } else {
        const numericId = BigInt(input)
        const formattedBytes32 = pad(toHex(numericId), { size: 32 })
        writeRevoke({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'revokeCertificate',
          args: [formattedBytes32],
        })
      }
    } catch (err) {
      console.error(err)
      setRevokeStatus('Error: ' + err.message)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8" style={{ color: 'var(--text)' }}>
      {/* 1. TEMPLATE SELECTION GALLERY */}
      <div className="card p-6 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <span>🎨</span> Template Selection Gallery
            </h2>
            <p className="text-xs text-muted">
              Select an institutional template design for this issuance
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 cursor-pointer font-medium"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
          >
            {showLivePreview ? '✕ Hide Live Preview' : '👁️ View Live Preview'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CERTIFICATE_TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplate === tmpl.id
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleTemplateChange(tmpl.id)}
                className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 shadow-md scale-[1.02]'
                    : 'opacity-75 hover:opacity-100 hover:border-gray-500'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg)',
                  borderColor: isSelected ? tmpl.defaultColor : 'var(--border)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{tmpl.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800/40">
                      {tmpl.badge}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-indigo-400 mb-1">{tmpl.subtitle}</p>
                  <p className="text-[11px] text-muted line-clamp-3 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>
                <div
                  className="mt-3 pt-2 text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1"
                  style={{ color: tmpl.defaultColor }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tmpl.defaultColor }} />
                  {isSelected ? 'Active Selection' : 'Click to Select'}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. LIVE UI CUSTOMIZER */}
      <div className="card p-6 shadow-md">
        <h2 className="font-display text-lg font-bold mb-1 flex items-center gap-2">
          <span>⚙️</span> Live Customization Suite
        </h2>
        <p className="text-xs text-muted mb-4">
          Personalize colors, borders, seals, and institutional branding before minting
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Accent Color Swatches */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-muted uppercase tracking-wider">
              Primary Accent Color
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {COLOR_PALETTES.map((pal) => (
                <button
                  key={pal.id}
                  type="button"
                  onClick={() => setPrimaryColor(pal.hex)}
                  title={pal.name}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    primaryColor === pal.hex ? 'scale-125 border-white shadow-md' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: pal.hex }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-7 h-7 rounded border-none cursor-pointer p-0 bg-transparent"
              />
              <span className="text-xs font-mono text-muted">{primaryColor}</span>
            </div>
          </div>

          {/* Border Style */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-muted uppercase tracking-wider">
              Border Style
            </label>
            <select
              value={borderStyle}
              onChange={(e) => setBorderStyle(e.target.value)}
              className="w-full input-field px-2.5 py-1.5 text-xs rounded"
            >
              {BORDER_STYLES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Seal / Watermark Placement */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-muted uppercase tracking-wider">
              Seal & Watermark
            </label>
            <select
              value={sealPlacement}
              onChange={(e) => setSealPlacement(e.target.value)}
              className="w-full input-field px-2.5 py-1.5 text-xs rounded"
            >
              {SEAL_PLACEMENTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Emblem / Badge Icon */}
          <div>
            <label className="block text-xs font-semibold mb-2 text-muted uppercase tracking-wider">
              Emblem / Crest
            </label>
            <select
              value={badgeIcon}
              onChange={(e) => setBadgeIcon(e.target.value)}
              className="w-full input-field px-2.5 py-1.5 text-xs rounded"
            >
              {BADGE_ICONS.map((badge) => (
                <option key={badge.id} value={badge.icon}>
                  {badge.label}
                </option>
              ))}
            </select>
            <div className="mt-2 flex items-center gap-2">
              <label className="text-[11px] text-indigo-400 cursor-pointer underline">
                Upload Custom Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              {customLogoUrl && (
                <button
                  type="button"
                  onClick={() => setCustomLogoUrl('')}
                  className="text-[10px] text-red-400 hover:underline"
                >
                  ✕ Remove
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Real-time Certificate Card Preview Drawer */}
        {showLivePreview && (
          <div className="mt-6 pt-5 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                Live Dynamic Preview ({selectedTemplate.toUpperCase()} TEMPLATE)
              </span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync Enabled
              </span>
            </div>
            <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 overflow-x-auto flex justify-center">
              <div
                style={{
                  transform: 'scale(0.72)',
                  transformOrigin: 'top center',
                  marginBottom: '-140px',
                }}
              >
                <CertificateCard
                  cert={{
                    studentName: studentName || 'Durva Amin',
                    courseName: courseName || 'B.Tech in Computer Science & Engineering',
                    issueDate: issueDate || '2026-05-18',
                  }}
                  tokenId="PREVIEW"
                  template={selectedTemplate}
                  metadata={{
                    templateId: selectedTemplate,
                    customization: {
                      primaryColor,
                      borderStyle,
                      sealPlacement,
                      badgeIcon,
                      logoUrl: customLogoUrl || null,
                    },
                    academicData: {
                      studentName: studentName || 'Durva Amin',
                      courseName: courseName || 'B.Tech in Computer Science & Engineering',
                      specializationTrack: specializationTrack || '',
                      gradeDistinction: gradeDistinction || '',
                      creditHours: creditHours || '',
                      issueDate: issueDate || '2026-05-18',
                      expiryDate: expiryDate || '',
                      signatoryName: signatoryName || '',
                      signatoryTitle: signatoryTitle || '',
                      coSignatoryName: coSignatoryName || '',
                      coSignatoryTitle: coSignatoryTitle || '',
                    },
                  }}
                  isRevoked={false}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. EXPANDED CERTIFICATE DETAILS FORM (NON-PERSONAL) */}
      <div className="card p-6 shadow-md">
        <h2 className="font-display text-xl font-bold mb-1">
          Issue Institutional Credential
        </h2>
        <p className="text-xs text-muted mb-4">
          Specify non-personal academic and professional attributes to be anchored to the student's soulbound token
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Student Wallet Address (0x...) *
              </label>
              <input
                type="text"
                placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
                className="w-full input-field px-3 py-2 font-mono text-xs rounded"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Durva Amin"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full input-field px-3 py-2 text-sm rounded"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Program / Course Title *
              </label>
              <input
                type="text"
                placeholder="e.g. B.Tech in Computer Science & Engineering"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full input-field px-3 py-2 text-sm rounded"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Specialization Track <span className="text-[10px] text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Distributed Systems (leave empty to hide)"
                value={specializationTrack}
                onChange={(e) => setSpecializationTrack(e.target.value)}
                className="w-full input-field px-3 py-2 text-sm rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Grade / Distinction Level <span className="text-[10px] text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Summa Cum Laude (leave empty to hide)"
                value={gradeDistinction}
                onChange={(e) => setGradeDistinction(e.target.value)}
                className="w-full input-field px-3 py-2 text-xs rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Credits / Duration <span className="text-[10px] text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 160 Credit Hours (leave empty to hide)"
                value={creditHours}
                onChange={(e) => setCreditHours(e.target.value)}
                className="w-full input-field px-3 py-2 text-xs rounded"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Issue Date *
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full input-field px-3 py-2 text-xs rounded"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Validity / Expiration <span className="text-[10px] text-gray-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Lifetime / No Expiration (leave empty to hide)"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full input-field px-3 py-2 text-xs rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Primary Signatory Name & Title <span className="text-[10px] text-gray-500 font-normal">(Optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Signatory Name (leave empty to hide)"
                  value={signatoryName}
                  onChange={(e) => setSignatoryName(e.target.value)}
                  className="flex-1 input-field px-3 py-2 text-xs rounded"
                />
                <input
                  type="text"
                  placeholder="Official Title (e.g. Dean)"
                  value={signatoryTitle}
                  onChange={(e) => setSignatoryTitle(e.target.value)}
                  className="flex-1 input-field px-3 py-2 text-xs rounded"
                />
              </div>
            </div>

            {selectedTemplate === 'corporate' && (
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Co-Signatory Name & Title (Corporate Dual Sign) <span className="text-[10px] text-gray-500 font-normal">(Optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Co-Signatory Name (leave empty to hide)"
                    value={coSignatoryName}
                    onChange={(e) => setCoSignatoryName(e.target.value)}
                    className="flex-1 input-field px-3 py-2 text-xs rounded"
                  />
                  <input
                    type="text"
                    placeholder="Official Title"
                    value={coSignatoryTitle}
                    onChange={(e) => setCoSignatoryTitle(e.target.value)}
                    className="flex-1 input-field px-3 py-2 text-xs rounded"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isIssuePending || isIssueConfirming}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer text-sm shadow-md"
          >
            {isIssuePending
              ? 'Confirm in Wallet...'
              : isIssueConfirming
              ? 'Minting on Hardhat Node...'
              : `Mint & Anchor ${CERTIFICATE_TEMPLATES.find((t) => t.id === selectedTemplate)?.name} Credential`}
          </button>
        </form>

        {status && <p className="mt-3 text-xs text-muted">{status}</p>}
        {isIssueSuccess && (
          <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-xs text-green-400">
            ✅ Credential successfully anchored to blockchain! Transaction Hash:{' '}
            <span className="font-mono">{issueHash}</span>
          </div>
        )}
        {issueError && (
          <p className="mt-3 text-xs text-red-500 break-words">
            Error: {issueError.message}
          </p>
        )}
      </div>

      {/* 4. BATCH ISSUE (CSV) */}
      <div className="card p-6 shadow-md">
        <h2 className="font-display text-lg font-bold mb-1">Batch Issue (CSV)</h2>
        <p className="text-xs text-muted mb-3">
          Bulk mint credentials using the active custom template (<span className="capitalize font-semibold text-indigo-400">{selectedTemplate}</span>).
        </p>

        <form onSubmit={handleBatchSubmit} className="space-y-3">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files[0])}
            className="w-full input-field px-3 py-2 text-xs rounded"
            required
          />
          <p className="text-[11px] text-muted">
            Supported columns: <code className="font-mono text-indigo-300">wallet, name, course, issue_date, track, grade, credits</code>
          </p>
          <button
            type="submit"
            disabled={isIssuePending || isIssueConfirming}
            className="w-full bg-purple-600 text-white font-medium py-2.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition cursor-pointer text-xs"
          >
            {isIssuePending
              ? 'Confirm Batch in Wallet...'
              : isIssueConfirming
              ? 'Minting Batch...'
              : 'Upload & Issue Batch'}
          </button>
        </form>
        {batchStatus && <p className="mt-2 text-xs text-muted">{batchStatus}</p>}
      </div>

      {/* 5. REVOKE CERTIFICATE FORM */}
      <div className="card p-6 shadow-md border-red-900/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">⛔</span>
          <h2 className="font-display text-lg font-bold text-red-500">
            Revoke Certificate
          </h2>
        </div>
        <p className="text-xs text-muted mb-3">
          Permanently invalidate an issued credential by Token ID or Certificate ID. The revocation status is written directly to the contract storage.
        </p>

        <form onSubmit={handleRevokeSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-muted mb-1">
              Certificate Token ID (e.g. 1) or Bytes32 ID
            </label>
            <input
              type="text"
              placeholder="e.g. 1 or 0x000...0001"
              value={revokeCertId}
              onChange={(e) => setRevokeCertId(e.target.value)}
              className="w-full input-field px-3 py-2 font-mono text-xs rounded"
              required
            />
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="confirm-revocation"
              checked={revokeConfirm}
              onChange={(e) => setRevokeConfirm(e.target.checked)}
              className="mt-0.5 cursor-pointer"
            />
            <label htmlFor="confirm-revocation" className="text-xs text-muted cursor-pointer">
              I certify that I am the authorized institutional issuer and understand that on-chain revocation is permanent.
            </label>
          </div>

          <button
            type="submit"
            disabled={!revokeConfirm || isRevokePending || isRevokeConfirming || !revokeCertId.trim()}
            className="w-full bg-red-600 text-white font-medium py-2 rounded-lg hover:bg-red-700 disabled:opacity-40 transition cursor-pointer text-xs"
          >
            {isRevokePending
              ? 'Confirm Revocation in Wallet...'
              : isRevokeConfirming
              ? 'Revoking on Hardhat Node...'
              : 'Revoke Certificate'}
          </button>
        </form>

        {revokeStatus && <p className="mt-2 text-xs text-muted">{revokeStatus}</p>}
        {isRevokeSuccess && (
          <div className="mt-2 p-2.5 rounded bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            ✅ Certificate #{revokeCertId} successfully revoked on-chain! Tx:{' '}
            <span className="font-mono">{revokeHash}</span>
          </div>
        )}
        {revokeWriteError && (
          <p className="mt-2 text-xs text-red-500 break-words">
            Error: {revokeWriteError.message}
          </p>
        )}
      </div>
    </div>
  )
}

export default IssuerPortal
