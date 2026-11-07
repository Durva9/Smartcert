import { PinataSDK } from 'pinata'

// Built-in presets for demo certificates minted by setupDemo.js
const DEMO_METADATA = {
  bafyLocalClassicDemo001: {
    name: 'B.Tech in Computer Science & Engineering Certificate',
    templateId: 'classic',
    customization: {
      primaryColor: '#b45309',
      borderStyle: 'double-solid',
      sealPlacement: 'bottom-right',
      badgeIcon: '🏛️',
    },
    academicData: {
      studentName: 'Durva Amin',
      courseName: 'B.Tech in Computer Science & Engineering',
      specializationTrack: 'Distributed Systems & Applied Cryptography',
      gradeDistinction: 'Summa Cum Laude (CGPA 9.8/10)',
      creditHours: '160 Credit Hours',
      issueDate: '2026-05-18',
      expiryDate: 'Lifetime / No Expiration',
      signatoryName: 'Dr. Eleanor Vance',
      signatoryTitle: 'Dean of Academic Affairs',
    },
  },
  bafyLocalModernDemo002: {
    name: 'Certified Smart Contract Security Auditor Credential',
    templateId: 'modern',
    customization: {
      primaryColor: '#06b6d4',
      borderStyle: 'geometric',
      sealPlacement: 'bottom-center',
      badgeIcon: '⚡',
    },
    academicData: {
      studentName: 'Durva Amin',
      courseName: 'Certified Smart Contract Security Auditor',
      specializationTrack: 'EVM Opcode Analysis & Protocol Auditing',
      gradeDistinction: 'Grade A+ (Top 1%)',
      creditHours: '48 Continuing Education Units',
      issueDate: '2026-08-14',
      expiryDate: 'Lifetime / No Expiration',
      signatoryName: 'Marcus Thorne',
      signatoryTitle: 'Chief Research Fellow',
    },
  },
  bafyLocalExecutiveDemo003: {
    name: 'Executive Leadership in Digital Transformation Certificate',
    templateId: 'executive',
    customization: {
      primaryColor: '#d97706',
      borderStyle: 'gold-leaf',
      sealPlacement: 'top-right',
      badgeIcon: '👑',
    },
    academicData: {
      studentName: 'Alex Rivera',
      courseName: 'Executive Leadership in Digital Transformation',
      specializationTrack: 'Decentralized Enterprise Architecture',
      gradeDistinction: 'Executive Distinction',
      creditHours: '80 Executive Hours',
      issueDate: '2026-09-30',
      expiryDate: 'Lifetime / No Expiration',
      signatoryName: 'Prof. Sarah Jenkins',
      signatoryTitle: 'Director of Executive Programs',
    },
  },
}

export async function uploadMetadataToIPFS(metadata) {
  const jwt = import.meta.env.VITE_PINATA_JWT
  if (jwt && jwt.trim() !== '') {
    try {
      const pinata = new PinataSDK({
        pinataJwt: jwt,
        pinataGateway: 'gateway.pinata.cloud',
      })
      const upload = await pinata.upload.public.json(metadata)
      const ipfsUri = `ipfs://${upload.cid}`
      try {
        localStorage.setItem(`scert_meta_${upload.cid}`, JSON.stringify(metadata))
      } catch (e) {}
      return ipfsUri
    } catch (err) {
      console.warn('Pinata upload failed, falling back to local metadata storage:', err)
    }
  }

  // Fallback for local development or demo without Pinata credentials
  const jsonStr = JSON.stringify(metadata)
  const encoder = new TextEncoder()
  const data = encoder.encode(jsonStr)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  const pseudoCid = `bafyLocal${hashHex.slice(0, 32)}`

  try {
    localStorage.setItem(`scert_meta_${pseudoCid}`, jsonStr)
  } catch (e) {}

  return `ipfs://${pseudoCid}`
}

export async function fetchCertificateMetadata(uri) {
  if (!uri) return null
  const cid = uri.replace(/^ipfs:\/\//, '').replace(/^https?:\/\/.*\/ipfs\//, '')

  // 1. Check built-in demo presets
  if (DEMO_METADATA[cid]) {
    return DEMO_METADATA[cid]
  }

  // 2. Check local browser storage
  try {
    const cached = localStorage.getItem(`scert_meta_${cid}`)
    if (cached) return JSON.parse(cached)
  } catch (e) {}

  // 3. Attempt fetch from IPFS public gateway
  try {
    const res = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`, {
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      const data = await res.json()
      try {
        localStorage.setItem(`scert_meta_${cid}`, JSON.stringify(data))
      } catch (e) {}
      return data
    }
  } catch (e) {}

  return null
}
