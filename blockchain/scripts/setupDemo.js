const hre = require("hardhat");

async function main() {
  const [deployer, student1, student2] = await hre.ethers.getSigners();
  console.log("==================================================");
  console.log("🎓 SmartCert Automated Local Demo Setup");
  console.log("==================================================");
  console.log("Deployer / Admin Address:", deployer.address);
  console.log("Student #1 Target Wallet:", student1.address);
  console.log("Student #2 Target Wallet:", student2.address);
  console.log("--------------------------------------------------");

  // 1. Deploy Contract
  console.log("Deploying SmartCert contract...");
  const smartCert = await hre.ethers.deployContract("SmartCert", [deployer.address]);
  await smartCert.waitForDeployment();
  const contractAddress = await smartCert.getAddress();

  console.log("✅ SmartCert deployed at:", contractAddress);

  // 2. Sample Institutional Credentials Data
  const demoCertificates = [
    {
      student: student1.address,
      name: "Durva Amin",
      course: "B.Tech in Computer Science & Engineering",
      track: "Distributed Systems & Applied Cryptography",
      date: "2026-05-18",
      grade: "Summa Cum Laude (CGPA 9.8/10)",
      credits: "160 Credit Hours",
      signatory: "Dr. Eleanor Vance",
      title: "Dean of Academic Affairs",
      template: "classic",
      uri: "ipfs://bafyLocalClassicDemo001",
    },
    {
      student: student1.address,
      name: "Durva Amin",
      course: "Certified Smart Contract Security Auditor",
      track: "EVM Opcode Analysis & Protocol Auditing",
      date: "2026-08-14",
      grade: "Grade A+ (Top 1%)",
      credits: "48 Continuing Education Units",
      signatory: "Marcus Thorne",
      title: "Chief Research Fellow",
      template: "modern",
      uri: "ipfs://bafyLocalModernDemo002",
    },
    {
      student: student2.address,
      name: "Alex Rivera",
      course: "Executive Leadership in Digital Transformation",
      track: "Decentralized Enterprise Architecture",
      date: "2026-09-30",
      grade: "Executive Distinction",
      credits: "80 Executive Hours",
      signatory: "Prof. Sarah Jenkins",
      title: "Director of Executive Programs",
      template: "executive",
      uri: "ipfs://bafyLocalExecutiveDemo003",
    },
  ];

  console.log("\nMinting sample institutional demo certificates...");

  for (let i = 0; i < demoCertificates.length; i++) {
    const cert = demoCertificates[i];
    const tx = await smartCert.issueCertificate(
      cert.student,
      cert.name,
      cert.course,
      cert.date,
      cert.uri
    );
    await tx.wait();
    console.log(
      `✓ Token #${i + 1} minted to ${cert.student.slice(0, 8)}... (${cert.course} [${cert.template.toUpperCase()}])`
    );
  }

  const total = await smartCert.totalIssued();
  console.log("--------------------------------------------------");
  console.log(`🎉 Demo setup complete! Total Certificates Issued: ${total}`);
  console.log(`🔗 Contract Address: ${contractAddress}`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
