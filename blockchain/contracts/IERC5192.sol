// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Minimal Soulbound Token interface (ERC-5192)
interface IERC5192 {
    /// @notice Emitted when a token is locked (non-transferable)
    event Locked(uint256 indexed tokenId);

    /// @notice Emitted when a token is unlocked (we never use this)
    event Unlocked(uint256 indexed tokenId);

    /// @notice Returns true if the token is locked
    function locked(uint256 tokenId) external view returns (bool);
}