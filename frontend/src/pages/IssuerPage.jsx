import { useState } from 'react'
import { useAccount, useReadContract, useChainId } from 'wagmi'
import Layout from '../Layout'
import IssuerPortal from '../IssuerPortal'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contract'

function IssuerPage() {
  const { address, isConnected, chain } = useAccount()
  const chainId = useChainId()
  const [demoBypass, setDemoBypass] = useState(false)

  const { data: owner, isLoading, error: readError } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'owner',
  })

  const isOwner = isConnected && owner && address?.toLowerCase() === owner.toLowerCase()
  const canAccess = isOwner || demoBypass

  return (
    <Layout>
      {!isConnected && (
        <div className="card max-w-md mx-auto p-6 text-center shadow-md">
          <p className="text-muted mb-2">Connect your wallet to access the Issuer Portal.</p>
          <p className="text-xs text-muted">
            Connect with Hardhat Account #0 (<code className="font-mono text-xs">0xf39Fd6...</code>) to issue certificates.
          </p>
        </div>
      )}

      {isConnected && isLoading && (
        <div className="card max-w-md mx-auto p-6 text-center text-muted shadow-md">
          <p className="animate-pulse">Checking institutional issuer permissions on-chain...</p>
        </div>
      )}

      {isConnected && !isLoading && !canAccess && (
        <div className="card max-w-xl mx-auto p-6 shadow-md border-red-500/40 text-left space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⛔</span>
            <div>
              <h2 className="font-display text-lg font-bold text-red-500">
                Unauthorized Issuer Wallet
              </h2>
              <p className="text-xs text-muted">
                Only the registered institutional owner wallet can issue or revoke credentials.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-xs space-y-2 font-mono">
            <div>
              <span className="text-muted block text-[10px] uppercase">Your Connected Wallet:</span>
              <span className="text-amber-400 break-all">{address}</span>
            </div>
            <div>
              <span className="text-muted block text-[10px] uppercase">Contract Registered Owner:</span>
              <span className={owner ? 'text-green-400 break-all' : 'text-red-400 font-semibold'}>
                {owner || '⚠️ Not detected on current network (is the contract deployed?)'}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-muted pt-1 border-t border-neutral-800">
              <span>Network: <strong className="text-neutral-200">{chain?.name || 'Local'} (Chain {chainId})</strong></span>
              <span>Target: <strong className="text-neutral-200">{CONTRACT_ADDRESS.slice(0, 8)}...</strong></span>
            </div>
          </div>

          {!owner ? (
            <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-1.5">
              <p className="font-bold">⚠️ Contract not detected at {CONTRACT_ADDRESS}</p>
              <p>To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted text-[11px]">
                <li>Ensure Hardhat is running: <code className="font-mono text-amber-200">npx hardhat node</code></li>
                <li>Deploy contracts: <code className="font-mono text-amber-200">npx hardhat run scripts/setupDemo.js --network localhost</code></li>
                <li>Make sure MetaMask is set to <strong className="text-amber-200">Hardhat Localhost</strong> (RPC: <code className="font-mono">http://127.0.0.1:8545</code>, Chain ID: <code className="font-mono">31337</code>).</li>
              </ol>
            </div>
          ) : (
            <div className="p-3 rounded bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 space-y-2">
              <p className="font-bold">💡 How to resolve:</p>
              <p className="text-[11px]">
                In MetaMask, switch to the university issuer account (<strong>Hardhat Account #0</strong>):
              </p>
              <div className="p-2 rounded bg-neutral-950 font-mono text-[11px] text-indigo-300 break-all">
                0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
              </div>
              <p className="text-[10px] text-muted">
                If not imported yet, click <em>Import Account</em> in MetaMask and paste Private Key:<br />
                <code className="text-indigo-400 font-mono select-all">0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80</code>
              </p>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-muted">Presenting or testing locally?</span>
            <button
              type="button"
              onClick={() => setDemoBypass(true)}
              className="text-xs px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium cursor-pointer transition shadow"
            >
              🔓 Unlock Issuer Portal (Demo Mode)
            </button>
          </div>
        </div>
      )}

      {isConnected && canAccess && <IssuerPortal />}
    </Layout>
  )
}

export default IssuerPage
