import { Link } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { CONTRACT_ADDRESS } from './contract'

function Layout({ children, showWallet = true }) {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">SmartCert</Link>

        {showWallet && (
          <div className="flex items-center gap-4">
            {isConnected ? (
              <>
                <span className="font-mono text-xs text-gray-600">{address}</span>
                <button
                  onClick={() => disconnect()}
                  className="bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={() => connect({ connector: connectors[0] })}
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
              >
                Connect Wallet
              </button>
            )}
          </div>
        )}
      </header>

      <p className="text-center text-xs text-gray-400 mt-2">Contract: {CONTRACT_ADDRESS}</p>

      <main className="p-6">{children}</main>
    </div>
  )
}

export default Layout