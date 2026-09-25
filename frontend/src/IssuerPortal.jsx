import { useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contract'
import { uploadMetadataToIPFS } from './ipfs'
import Papa from 'papaparse'

function IssuerPortal() {
  const [studentAddress, setStudentAddress] = useState('')
  const [studentName, setStudentName] = useState('')
  const [courseName, setCourseName] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [status, setStatus] = useState('')

  const [csvFile, setCsvFile] = useState(null)
  const [batchStatus, setBatchStatus] = useState('')

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('Uploading metadata to IPFS...')

    try {
      const metadata = {
        name: `${courseName} Certificate`,
        description: `Awarded to ${studentName} for completing ${courseName}`,
        attributes: [
          { trait_type: 'Student Name', value: studentName },
          { trait_type: 'Course', value: courseName },
          { trait_type: 'Issue Date', value: issueDate },
        ],
      }

      const tokenURI = await uploadMetadataToIPFS(metadata)
      setStatus('Metadata uploaded. Sending transaction...')

      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'issueCertificate',
        args: [studentAddress, studentName, courseName, issueDate, tokenURI],
      })
    } catch (err) {
      console.error(err)
      setStatus('Error: ' + err.message)
    }
  }

  async function handleBatchSubmit(e) {
    e.preventDefault()
    if (!csvFile) return

    setBatchStatus('Reading CSV...')

    Papa.parse(csvFile, {
  header: true,
  skipEmptyLines: true,
  transformHeader: (header) => header.trim().replace(/^\uFEFF/, ''),
  complete: async (results) => {
    console.log('Parsed CSV rows:', results.data)
        try {
          const rows = results.data
          setBatchStatus(`Uploading ${rows.length} metadata files to IPFS...`)

          const uris = []
          for (const row of rows) {
            const metadata = {
              name: `${row.course} Certificate`,
              description: `Awarded to ${row.name} for completing ${row.course}`,
              attributes: [
                { trait_type: 'Student Name', value: row.name },
                { trait_type: 'Course', value: row.course },
                { trait_type: 'Issue Date', value: row.issue_date },
              ],
            }
            const uri = await uploadMetadataToIPFS(metadata)
            uris.push(uri)
          }

          setBatchStatus('Sending batch transaction...')

          writeContract({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'batchIssueCertificates',
            args: [
              rows.map((r) => (r.wallet || '').trim()),
              rows.map((r) => r.name),
              rows.map((r) => r.course),
              rows.map((r) => r.issue_date),
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

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Issue Certificate</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Student Wallet Address (0x...)"
          value={studentAddress}
          onChange={(e) => setStudentAddress(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="text"
          placeholder="Student Full Name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="text"
          placeholder="Course Title"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
        />
        <button
          type="submit"
          disabled={isPending || isConfirming}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Confirm in wallet...' : isConfirming ? 'Minting...' : 'Issue Certificate'}
        </button>
      </form>

      {status && <p className="mt-3 text-sm text-gray-600">{status}</p>}
      {isSuccess && (
        <p className="mt-3 text-sm text-green-600">
          ✅ Certificate issued! Tx: {hash}
        </p>
      )}

      <hr className="my-6" />

      <h2 className="text-xl font-bold mb-4">Batch Issue (CSV)</h2>
      <form onSubmit={handleBatchSubmit} className="space-y-3">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setCsvFile(e.target.files[0])}
          className="w-full border rounded px-3 py-2"
          required
        />
        <p className="text-xs text-gray-500">
          Columns: wallet, name, course, issue_date
        </p>
        <button
          type="submit"
          disabled={isPending || isConfirming}
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isPending ? 'Confirm in wallet...' : isConfirming ? 'Minting batch...' : 'Upload & Issue Batch'}
        </button>
      </form>

      {batchStatus && <p className="mt-3 text-sm text-gray-600">{batchStatus}</p>}
      {writeError && (
  <p className="mt-3 text-sm text-red-600 break-words">
    Error: {writeError.message}
  </p>
)}
    </div>
  )
}

export default IssuerPortal