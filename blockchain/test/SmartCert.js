const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("SmartCert", function () {
  const URI = "ipfs://bafyExampleCID";

  // Runs once, then every test starts from a fresh copy of this state
  async function deployFixture() {
    const [owner, student, student2, other] = await ethers.getSigners();
    const smartCert = await ethers.deployContract("SmartCert", [owner.address]);
    return { smartCert, owner, student, student2, other };
  }

  async function issueOne(smartCert, student) {
    await smartCert.issueCertificate(
      student.address,
      "Durva Amin",
      "B.Tech Computer Science",
      "2026-09-21",
      URI
    );
  }

  describe("Deployment", function () {
    it("sets the owner, name and symbol", async function () {
      const { smartCert, owner } = await loadFixture(deployFixture);
      expect(await smartCert.owner()).to.equal(owner.address);
      expect(await smartCert.name()).to.equal("SmartCert");
      expect(await smartCert.symbol()).to.equal("SCERT");
    });

    it("supports ERC-5192 and ERC-721 via EIP-165", async function () {
      const { smartCert } = await loadFixture(deployFixture);
      expect(await smartCert.supportsInterface("0xb45a3c0e")).to.equal(true); // ERC-5192
      expect(await smartCert.supportsInterface("0x80ac58cd")).to.equal(true); // ERC-721
    });
  });

  describe("Issuing", function () {
    it("issues a certificate and stores its data", async function () {
      const { smartCert, student } = await loadFixture(deployFixture);
      await issueOne(smartCert, student);

      expect(await smartCert.ownerOf(1)).to.equal(student.address);
      expect(await smartCert.tokenURI(1)).to.equal(URI);

      const cert = await smartCert.getCertificate(1);
      expect(cert.studentName).to.equal("Durva Amin");
      expect(cert.courseName).to.equal("B.Tech Computer Science");
      expect(cert.issueDate).to.equal("2026-09-21");
      expect(cert.metadataURI).to.equal(URI);
    });

    it("emits Locked and CertificateIssued", async function () {
      const { smartCert, student } = await loadFixture(deployFixture);
      await expect(
        smartCert.issueCertificate(student.address, "A", "Course", "2026-01-01", URI)
      )
        .to.emit(smartCert, "Locked").withArgs(1)
        .and.to.emit(smartCert, "CertificateIssued").withArgs(1, student.address, "Course");
    });

    it("reports every issued token as locked", async function () {
      const { smartCert, student } = await loadFixture(deployFixture);
      await issueOne(smartCert, student);
      expect(await smartCert.locked(1)).to.equal(true);
    });

    it("only the owner can issue", async function () {
      const { smartCert, student, other } = await loadFixture(deployFixture);
      await expect(
        smartCert.connect(other).issueCertificate(student.address, "A", "C", "2026-01-01", URI)
      )
        .to.be.revertedWithCustomError(smartCert, "OwnableUnauthorizedAccount")
        .withArgs(other.address);
    });

    it("cannot issue to the zero address", async function () {
      const { smartCert } = await loadFixture(deployFixture);
      await expect(
        smartCert.issueCertificate(ethers.ZeroAddress, "A", "C", "2026-01-01", URI)
      ).to.be.revertedWithCustomError(smartCert, "ERC721InvalidReceiver");
    });
  });

  describe("Soulbound (non-transferable)", function () {
    it("blocks transferFrom", async function () {
      const { smartCert, student, other } = await loadFixture(deployFixture);
      await issueOne(smartCert, student);
      await expect(
        smartCert.connect(student).transferFrom(student.address, other.address, 1)
      ).to.be.revertedWithCustomError(smartCert, "ErrLocked");
    });

    it("blocks both safeTransferFrom versions", async function () {
      const { smartCert, student, other } = await loadFixture(deployFixture);
      await issueOne(smartCert, student);
      const c = smartCert.connect(student);

      await expect(
        c["safeTransferFrom(address,address,uint256)"](student.address, other.address, 1)
      ).to.be.revertedWithCustomError(smartCert, "ErrLocked");

      await expect(
        c["safeTransferFrom(address,address,uint256,bytes)"](student.address, other.address, 1, "0x")
      ).to.be.revertedWithCustomError(smartCert, "ErrLocked");
    });

    it("blocks transfers even by an approved address", async function () {
      const { smartCert, student, other } = await loadFixture(deployFixture);
      await issueOne(smartCert, student);
      await smartCert.connect(student).approve(other.address, 1);
      await expect(
        smartCert.connect(other).transferFrom(student.address, other.address, 1)
      ).to.be.revertedWithCustomError(smartCert, "ErrLocked");
    });

    it("blocks the contract owner from moving a student's token", async function () {
      const { smartCert, owner, student, other } = await loadFixture(deployFixture);
      await issueOne(smartCert, student);
      await expect(
        smartCert.connect(owner).transferFrom(student.address, other.address, 1)
      ).to.be.revertedWithCustomError(smartCert, "ErrLocked");
    });
  });

  describe("Batch issuing", function () {
    it("issues many certificates in one transaction", async function () {
      const { smartCert, student, student2, other } = await loadFixture(deployFixture);
      await smartCert.batchIssueCertificates(
        [student.address, student2.address, other.address],
        ["Alice", "Bob", "Carol"],
        ["Workshop", "Workshop", "Workshop"],
        ["2026-09-01", "2026-09-01", "2026-09-01"],
        ["ipfs://1", "ipfs://2", "ipfs://3"]
      );

      expect(await smartCert.ownerOf(1)).to.equal(student.address);
      expect(await smartCert.ownerOf(2)).to.equal(student2.address);
      expect(await smartCert.ownerOf(3)).to.equal(other.address);
      expect((await smartCert.getCertificate(2)).studentName).to.equal("Bob");
    });

    it("rejects an empty batch", async function () {
      const { smartCert } = await loadFixture(deployFixture);
      await expect(
        smartCert.batchIssueCertificates([], [], [], [], [])
      ).to.be.revertedWithCustomError(smartCert, "ErrEmptyBatch");
    });

    it("rejects arrays of different lengths", async function () {
      const { smartCert, student } = await loadFixture(deployFixture);
      await expect(
        smartCert.batchIssueCertificates([student.address], ["A", "B"], ["C"], ["D"], ["E"])
      ).to.be.revertedWithCustomError(smartCert, "ErrLengthMismatch");
    });

    it("rejects batches over the maximum size", async function () {
      const { smartCert, student } = await loadFixture(deployFixture);
      const n = 101;
      await expect(
        smartCert.batchIssueCertificates(
          Array(n).fill(student.address),
          Array(n).fill("A"),
          Array(n).fill("C"),
          Array(n).fill("D"),
          Array(n).fill("ipfs://x")
        )
      ).to.be.revertedWithCustomError(smartCert, "ErrBatchTooLarge");
    });

    it("only the owner can batch issue", async function () {
      const { smartCert, student, other } = await loadFixture(deployFixture);
      await expect(
        smartCert.connect(other).batchIssueCertificates(
          [student.address], ["A"], ["C"], ["D"], ["ipfs://x"]
        )
      ).to.be.revertedWithCustomError(smartCert, "OwnableUnauthorizedAccount");
    });
  });

  describe("Reading", function () {
    it("reverts for a token that doesn't exist", async function () {
      const { smartCert } = await loadFixture(deployFixture);
      await expect(smartCert.getCertificate(999))
        .to.be.revertedWithCustomError(smartCert, "ERC721NonexistentToken");
      await expect(smartCert.locked(999))
        .to.be.revertedWithCustomError(smartCert, "ERC721NonexistentToken");
    });
  });
});