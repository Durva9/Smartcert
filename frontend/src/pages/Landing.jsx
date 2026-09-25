import { Link } from 'react-router-dom'

function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">SmartCert</h1>
        <p className="text-gray-600 mb-8">Soulbound academic credentials on Ethereum</p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/issuer"
            className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow hover:bg-blue-700 w-40"
          >
            Issuer
          </Link>
          <Link
            to="/student"
            className="bg-green-600 text-white px-6 py-4 rounded-lg shadow hover:bg-green-700 w-40"
          >
            Student
          </Link>
          <Link
            to="/verifier"
            className="bg-purple-600 text-white px-6 py-4 rounded-lg shadow hover:bg-purple-700 w-40"
          >
            Verifier
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Landing