import { Link } from 'react-router-dom'
import { useTheme } from '../useTheme'

function Landing() {
  const [isDark, setIsDark] = useTheme()

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      <button
        onClick={() => setIsDark(!isDark)}
        className="fixed top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center glow-border"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <div className="text-center max-w-xl">
        <p
          className="text-xs tracking-widest uppercase mb-3"
          style={{ color: 'var(--accent)' }}
        >
          Blockchain-Verified Credentials
        </p>
        <h1 className="font-display text-5xl font-bold mb-3">SmartCert</h1>
        <p className="text-muted mb-10">
          Soulbound academic credentials on Ethereum
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            to="/issuer"
            className="card glow-border p-6 font-display font-semibold transition"
          >
            🏛️ Issuer
          </Link>
          <Link
            to="/student"
            className="card glow-border p-6 font-display font-semibold transition"
          >
            🎓 Student
          </Link>
          <Link
            to="/verifier"
            className="card glow-border p-6 font-display font-semibold transition"
          >
            🔍 Verifier
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Landing