// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC5192} from "./IERC5192.sol";

contract SmartCert is ERC721URIStorage, Ownable, IERC5192 {
    // ---------- Errors ----------
    error ErrLocked();
    error ErrEmptyBatch();
    error ErrBatchTooLarge();
    error ErrLengthMismatch();

    // ---------- Data ----------
    struct Certificate {
        string studentName;
        string courseName;
        string issueDate;
        string metadataURI; // IPFS link to the certificate metadata
    }

    // tokenId => certificate data
    mapping(uint256 => Certificate) public certificates;

    // Token IDs start at 1, so ID 0 never looks like a real certificate
    uint256 private _nextTokenId = 1;

    // Cap per batch so one transaction can't exceed the block gas limit
    uint256 public constant MAX_BATCH_SIZE = 100;

    // ---------- Events ----------
    event CertificateIssued(
        uint256 indexed tokenId,
        address indexed student,
        string courseName
    );

    constructor(address initialOwner)
        ERC721("SmartCert", "SCERT")
        Ownable(initialOwner)
    {}

    // ---------- Issuing (university admin only) ----------

    function issueCertificate(
        address student,
        string memory studentName,
        string memory courseName,
        string memory issueDate,
        string memory uri
    ) external onlyOwner returns (uint256) {
        return _issue(student, studentName, courseName, issueDate, uri);
    }

    function batchIssueCertificates(
        address[] memory students,
        string[] memory studentNames,
        string[] memory courseNames,
        string[] memory issueDates,
        string[] memory uris
    ) external onlyOwner {
        if (students.length == 0) revert ErrEmptyBatch();
        if (students.length > MAX_BATCH_SIZE) revert ErrBatchTooLarge();
        if (
            students.length != studentNames.length ||
            students.length != courseNames.length ||
            students.length != issueDates.length ||
            students.length != uris.length
        ) revert ErrLengthMismatch();

        for (uint256 i = 0; i < students.length; ) {
            _issue(students[i], studentNames[i], courseNames[i], issueDates[i], uris[i]);
            unchecked { ++i; }
        }
    }

    function _issue(
        address student,
        string memory studentName,
        string memory courseName,
        string memory issueDate,
        string memory uri
    ) internal returns (uint256 tokenId) {
        tokenId = _nextTokenId++;

        _mint(student, tokenId); // reverts if student is the zero address
        _setTokenURI(tokenId, uri);

        certificates[tokenId] = Certificate(studentName, courseName, issueDate, uri);

        emit Locked(tokenId); // ERC-5192: announce the token is locked
        emit CertificateIssued(tokenId, student, courseName);
    }

    // ---------- Reading (free, anyone can call) ----------

    function getCertificate(uint256 tokenId)
        external
        view
        returns (Certificate memory)
    {
        _requireOwned(tokenId); // reverts if the token doesn't exist
        return certificates[tokenId];
    }

    // ---------- ERC-5192: every token is permanently locked ----------

    function locked(uint256 tokenId) external view override returns (bool) {
        _requireOwned(tokenId);
        return true;
    }

    // ---------- Block all transfers ----------

    function transferFrom(address, address, uint256)
        public
        pure
        override(ERC721, IERC721)
    {
        revert ErrLocked();
    }

    function safeTransferFrom(address, address, uint256, bytes memory)
        public
        pure
        override(ERC721, IERC721)
    {
        revert ErrLocked();
    }

    // ---------- EIP-165: advertise ERC-5192 support ----------

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage)
        returns (bool)
    {
        return
            interfaceId == type(IERC5192).interfaceId || // 0xb45a3c0e
            super.supportsInterface(interfaceId);
    }
}