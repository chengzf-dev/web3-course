// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

interface ICourseCertificate {
    function mintCertificate(address to, string calldata courseId) external returns (uint256);
}

contract Courses is Ownable {
    using SafeERC20 for IERC20;

    struct Course {
        address author;
        uint256 price;
        bool exists;
    }

    IERC20 public immutable ydToken;
    ICourseCertificate public certificate;

    uint256 public platformFeeBps;
    address public feeRecipient;

    mapping(string courseId => Course) private _courses;
    mapping(string courseId => mapping(address student => bool)) private _purchased;

    event CourseCreated(string courseId, address indexed author, uint256 price);
    event CoursePurchased(string courseId, address indexed student, uint256 price, uint256 fee);
    event PlatformFeeUpdated(uint256 feeBps);
    event FeeRecipientUpdated(address indexed feeRecipient);
    event CertificateUpdated(address indexed certificate);

    constructor(
        address tokenAddress,
        address certificateAddress,
        address initialOwner,
        address initialFeeRecipient,
        uint256 initialFeeBps
    ) Ownable(initialOwner) {
        require(tokenAddress != address(0), "Courses: token is zero");
        require(initialFeeRecipient != address(0), "Courses: fee recipient is zero");
        require(initialFeeBps <= 1000, "Courses: fee too high");
        ydToken = IERC20(tokenAddress);
        certificate = ICourseCertificate(certificateAddress);
        feeRecipient = initialFeeRecipient;
        platformFeeBps = initialFeeBps;
    }

    function createCourse(string calldata courseId, uint256 price, address author) external {
        require(!_courses[courseId].exists, "Courses: course exists");
        require(author != address(0), "Courses: author is zero");
        require(msg.sender == author, "Courses: caller must be author");
        require(price > 0, "Courses: price is zero");

        _courses[courseId] = Course({author: author, price: price, exists: true});
        emit CourseCreated(courseId, author, price);
    }

    function buyCourse(string calldata courseId) external {
        Course memory course = _courses[courseId];
        require(course.exists, "Courses: course missing");
        require(!_purchased[courseId][msg.sender], "Courses: already purchased");

        uint256 fee = (course.price * platformFeeBps) / 10_000;
        uint256 authorAmount = course.price - fee;

        ydToken.safeTransferFrom(msg.sender, feeRecipient, fee);
        ydToken.safeTransferFrom(msg.sender, course.author, authorAmount);

        _purchased[courseId][msg.sender] = true;

        if (address(certificate) != address(0)) {
            certificate.mintCertificate(msg.sender, courseId);
        }

        emit CoursePurchased(courseId, msg.sender, course.price, fee);
    }

    function courseInfo(string calldata courseId) external view returns (Course memory) {
        return _courses[courseId];
    }

    function hasPurchased(string calldata courseId, address student) external view returns (bool) {
        return _purchased[courseId][student];
    }

    function setPlatformFeeBps(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Courses: fee too high");
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Courses: fee recipient is zero");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }

    function setCertificate(address newCertificate) external onlyOwner {
        certificate = ICourseCertificate(newCertificate);
        emit CertificateUpdated(newCertificate);
    }
}
