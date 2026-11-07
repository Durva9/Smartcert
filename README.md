SmartCert 🎓

Decentralized, Soulbound Academic Credentialing & Verification Platform
Powered by Ethereum (ERC-721 / ERC-5192), IPFS, and React.

📌 Project Overview

SmartCert is a decentralized credential issuance and verification ecosystem designed to eliminate diploma fraud and streamline institutional verification.

Educational degrees and professional certificates are minted as Soulbound Tokens (SBTs) under the ERC-5192 standard. Because SBTs are permanently locked to the recipient student's wallet, they cannot be transferred, sold, or stolen.

SmartCert features an advanced Multi-Template Customization Suite, rich non-personal academic metadata anchored to IPFS, and an on-chain Certificate Revocation Engine with automatic tamper-evident watermarking.

🚀 Key Features
1. 🔒 Soulbound & Tamper-Proof (ERC-721 / ERC-5192)
Non-Transferable: Tokens are permanently bound to the student wallet. Any attempt to call transferFrom or safeTransferFrom reverts with ErrLocked().
Institutional Authority: Only the registered University Admin wallet (onlyOwner) can mint or revoke credentials.
2. 🎨 Multi-Template & Live Customization Suite

The Certificate Issuer panel provides four distinct pre-built visual designs:

Classic Academic: Traditional ivory parchment, double ornate borders, serif typography, and formal university seal.
Modern Tech: Cyber dark styling with glowing neon indigo and cyan accents, clean sans-serif typography, and digital badges.
Executive Minimal: Spacious corporate minimalism, gold & slate hairline accents, and an executive signature block.
Corporate Achievement: Bold banner header, dual corporate signatories (Program Director and Dean), and professional achievement badges.
Live Customizer: Customize primary accent colors, border styles (Double Solid, Gold Leaf Frame, Minimalist Line, Geometric Tech), seal placement, and institutional emblems with a real-time live preview before minting.
3. 📋 Institutional Academic Metrics (Strictly Non-Personal)

Stores rich institutional metrics on IPFS without exposing sensitive personal information:

Program / Course Name & Specialization Track
Final Grade / Distinction Level (e.g. Summa Cum Laude, Grade A+)
Credit Hours / Program Duration
Issue Date & Expiration/Validity Date
Embedded QR Verification Blocks & dynamic Token IDs
Primary & Co-Signatory Digital Signatures (All advanced metrics are optional and omitted from certificates if left blank).
4. ⛔ On-Chain Revocation Engine
Issuers can permanently invalidate a credential on-chain by Certificate Token ID.
Public verifiers and student portals immediately flag revoked credentials with a prominent ⛔ REVOKED badge, warning notice, and an official distressed red diagonal watermark stamp across certificate views and exported PDFs.
5. 🔍 Multi-Channel Public Verification

Third parties (employers, recruiters, academic boards) can verify credential legitimacy in three ways without connecting a wallet or paying fees:

By Student Wallet Address: Displays all authenticated credentials awarded to that address.
By Token ID: Directly checks the on-chain validity and historical status of a specific certificate.
By PDF Cryptographic Upload: Parses the embedded token ID and SHA-256 digest from a downloaded PDF to verify that the file has not been altered.
🛠️ Tech Stack & Architecture
text
Smartcert-main/
├── blockchain/                 # Hardhat Ethereum Environment
│   ├── contracts/
│   │   ├── SmartCert.sol       # ERC-721 + ERC-5192 Soulbound Certificate Contract
│   │   └── IERC5192.sol        # Minimal ERC-5192 Soulbound Interface
│   ├── scripts/
│   │   ├── deploy.js           # Standard deployment script
│   │   └── setupDemo.js        # Automated deployment + sample demo minting script
│   ├── test/
│   │   └── SmartCert.js        # Comprehensive Hardhat Chai test suite
│   └── hardhat.config.js       # Solidity 0.8.28 compiler settings
└── frontend/                   # Modern React Single-Page Application
    ├── src/
    │   ├── pages/              # Landing, IssuerPage, StudentPage, VerifierPage
    │   ├── CertificateCard.jsx # Dynamic multi-template renderer & customization engine
    │   ├── CertificateItem.jsx # Student portal card with inline preview & downloads
    │   ├── IssuerPortal.jsx    # Issuance, template gallery, live preview & revocation
    │   ├── contract.js         # Contract address & ABI integration
    │   ├── wagmi.js            # Wagmi & Viem chain configuration
    │   ├── ipfs.js             # Pinata IPFS & local fallback caching
    │   ├── pdfCert.js          # High-resolution PDF export with templates
    │   └── pdfVerify.js        # Cryptographic PDF parser & verification
    └── vite.config.js          # Vite 8 + Tailwind CSS v4 setup
⚡ Step-by-Step Run Instructions (From Scratch)

You will need three terminal windows to run the local blockchain, deploy the demo data, and host the frontend.

Step 1: Install Dependencies

Open a terminal at the project root:

bash
# 1. Install blockchain dependencies
cd blockchain
npm install
# 2. Install frontend dependencies
cd ../frontend
npm install
Step 2: Start the Local Hardhat Node (Terminal 1)

In your first terminal, start the local Hardhat JSON-RPC node:

bash
cd blockchain
npx hardhat node

Keep this terminal open. Hardhat will start an Ethereum node at http://127.0.0.1:8545/ (Chain ID 31337) and output 20 pre-funded test accounts (10,000 ETH each).

Step 3: Run the Automated Setup Demo Script (Terminal 2)

In a second terminal, deploy the smart contract and pre-mint sample institutional credentials:

bash
cd blockchain
npx hardhat run scripts/setupDemo.js --network localhost

Expected output:

text
==================================================
🎓 SmartCert Automated Local Demo Setup
==================================================
Deployer / Admin Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Student #1 Target Wallet: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
...
✅ SmartCert deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✓ Token #1 minted (B.Tech in Computer Science & Engineering [CLASSIC])
✓ Token #2 minted (Certified Smart Contract Security Auditor [MODERN])
✓ Token #3 minted (Executive Leadership in Digital Transformation [EXECUTIVE])
🎉 Demo setup complete! Total Certificates Issued: 3
Step 4: Launch the Frontend Application (Terminal 3)

In your third terminal, start the Vite development server:

bash
cd frontend
npm run dev

Open your browser and navigate to:

http://localhost:5173

---
## 🦊 MetaMask Configuration
To interact with the smart contract on your local machine, configure MetaMask:
### 1. Add Hardhat Localhost Network
1. Click the **Network Selector** in MetaMask -> **Add network** -> **Add a network manually**.
2. Enter the network details:
   * **Network Name:** `Hardhat Localhost`
   * **New RPC URL:** `http://127.0.0.1:8545`
   * **Chain ID:** `31337`
   * **Currency Symbol:** `ETH`
3. Click **Save** and switch to `Hardhat Localhost`.
### 2. Import Hardhat Test Accounts
In MetaMask, click the **Account Selector** -> **Add account or hardware wallet** -> **Import account**, then import the private keys:
| Account | Address | Private Key | Role |
| :--- | :--- | :--- | :--- |
| **Account #0** | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` | 🏛️ **Issuer / University Admin** |
| **Account #1** | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` | 🎓 **Student #1** |
| **Account #2** | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a` | 🎓 **Student #2** |
> **Avoid Nonce Errors:** Whenever you restart `npx hardhat node`, reset MetaMask's cached transaction counter by going to:  
> **MetaMask** -> **Settings** -> **Advanced** -> **Clear activity tab data**.
---
## 🧪 Demonstration Walkthrough
1. **Student Credential Gallery (`/student`):**
   * Connect MetaMask with **Student #1** (`0x7099...`).
   * Navigate to `/student` to view the pre-minted credentials.
   * Click **👁️ View Certificate** to inspect the dynamic styling.
   * Test **Download PDF** and **Download PNG**.
2. **Issuer Customization Suite (`/issuer`):**
   * Switch MetaMask to the **Issuer Admin** (`0xf39F...`).
   * Navigate to `/issuer`.
   * Select a template from the gallery (e.g. *Modern Tech* or *Corporate Achievement*).
   * Customize colors, border style, emblem, and optional metrics with the **Live Dynamic Preview**.
   * Enter Student #1's address and mint a new certificate.
3. **Revocation & Public Verification (`/verifier`):**
   * In `/issuer`, scroll to **Revoke Certificate**, enter Token ID `1`, confirm the checkbox, and submit the revocation transaction.
   * Navigate to `/verifier`, search for Token ID `1` or Student #1's address.
   * Observe the prominent **`⛔ REVOKED`** badge, alert banner, and the revoked watermark.
   * Upload the previously exported PDF into the verifier to test cryptographic verification.
---
