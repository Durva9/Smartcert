import { Link } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { CONTRACT_ADDRESS } from './contract'
import { useTheme } from './useTheme'

function Layout({ children, showWallet = true }) {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [isDark, setIsDark] = useTheme()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
      >
        <Link to="/" className="font-display text-xl font-bold flex items-center gap-2">
          <span style={{ color: 'var(--accent)' }}>◆</span> SmartCert
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDark(!isDark)}
            className="w-9 h-9 rounded-full flex items-center justify-center glow-border"
            aria-label="Toggle dark mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {showWallet && (
            <>
              {isConnected ? (
                <>
                  <span
                    className="font-mono text-xs px-3 py-1.5 rounded-full glow-border hidden sm:inline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                  <button
                    onClick={() => disconnect()}
                    className="text-white px-4 py-1.5 rounded-full text-sm font-medium"
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={() => connect({ connector: connectors[0] })}
                  className="px-4 py-1.5 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Connect Wallet
                </button>
              )}
            </>
          )}
        </div>
      </header>

      <p className="text-center text-xs py-2" style={{ color: 'var(--text-muted)' }}>
        Contract: <span className="font-mono">{CONTRACT_ADDRESS}</span>
      </p>

      <main className="p-6">{children}</main>
    </div>
  )
}

export default Layout