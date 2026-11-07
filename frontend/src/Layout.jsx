import { Link } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { hardhat } from 'wagmi/chains'
import { CONTRACT_ADDRESS } from './contract'
import { useTheme } from './useTheme'

function Layout({ children, showWallet = true }) {
  const { address, isConnected, chain } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const [isDark, setIsDark] = useTheme()

  const isWrongNetwork = isConnected && chainId !== hardhat.id

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      {/* Network Warning Banner */}
      {isWrongNetwork && (
        <div className="bg-amber-600/25 border-b border-amber-500/40 text-amber-300 text-xs py-2.5 px-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">⚠️</span>
            <span>
              <strong>Wrong Network:</strong> MetaMask is connected to <strong>{chain?.name || `Chain ID ${chainId}`}</strong> instead of <strong>Hardhat Localhost</strong>. Transactions on this network will fail or trigger security alerts.
            </span>
          </div>
          <button
            onClick={() => switchChain?.({ chainId: hardhat.id })}
            className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-3 py-1 rounded text-xs transition cursor-pointer shadow"
          >
            Switch to Hardhat Localhost (31337)
          </button>
        </div>
      )}

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
            className="w-9 h-9 rounded-full flex items-center justify-center glow-border cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {showWallet && (
            <>
              {isConnected ? (
                <>
                  {/* Network Indicator Pill */}
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                      chainId === hardhat.id
                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30'
                    }`}
                  >
                    {chainId === hardhat.id ? '● Hardhat (31337)' : `⚠️ ${chain?.name || 'Wrong Chain'}`}
                  </span>

                  <span
                    className="font-mono text-xs px-3 py-1.5 rounded-full glow-border hidden sm:inline"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>

                  <button
                    onClick={() => disconnect()}
                    className="text-white px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer"
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={() => connect({ connector: connectors[0] })}
                  className="px-4 py-1.5 rounded-full text-sm font-medium text-white cursor-pointer"
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
