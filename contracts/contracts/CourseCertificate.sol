// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CourseCertificate is ERC721, Ownable {
    struct CertificateData {
        string courseId;
        uint256 issuedAt;
    }

    address public minter;
    uint256 public nextTokenId;

    mapping(uint256 tokenId => CertificateData) private _certificateData;

    event MinterUpdated(address indexed minter);
    event CertificateIssued(address indexed student, string courseId, uint256 tokenId);

    constructor(address initialOwner) ERC721("Web3 Course Certificate", "W3C") Ownable(initialOwner) {
        nextTokenId = 1;
    }

    modifier onlyMinter() {
        require(msg.sender == minter, "CourseCertificate: caller is not minter");
        _;
    }

    function setMinter(address newMinter) external onlyOwner {
        require(newMinter != address(0), "CourseCertificate: minter is zero");
        minter = newMinter;
        emit MinterUpdated(newMinter);
    }

    function mintCertificate(address to, string calldata courseId)
        external
        onlyMinter
        returns (uint256)
    {
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        _certificateData[tokenId] = CertificateData({courseId: courseId, issuedAt: block.timestamp});
        emit CertificateIssued(to, courseId, tokenId);
        return tokenId;
    }

    function certificateData(uint256 tokenId) external view returns (CertificateData memory) {
        require(_ownerOf(tokenId) != address(0), "CourseCertificate: nonexistent token");
        return _certificateData[tokenId];
    }
}
