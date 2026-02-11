"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  API_BASE: () => API_BASE,
  adminApproveCourse: () => adminApproveCourse,
  adminFreezeUser: () => adminFreezeUser,
  adminUnpublishCourse: () => adminUnpublishCourse,
  contracts: () => contracts,
  createCourse: () => createCourse,
  fetchCourse: () => fetchCourse,
  fetchCourseContent: () => fetchCourseContent,
  fetchCourses: () => fetchCourses,
  fetchMe: () => fetchMe,
  getCourseById: () => getCourseById,
  getCourses: () => getCourses,
  recordPurchase: () => recordPurchase,
  requestAuthChallenge: () => requestAuthChallenge,
  requestPublishCourse: () => requestPublishCourse,
  unpublishCourse: () => unpublishCourse,
  updateCourse: () => updateCourse,
  verifyAuthSignature: () => verifyAuthSignature
});
module.exports = __toCommonJS(index_exports);

// src/api.ts
var DEFAULT_API_BASE = "http://127.0.0.1:3001";
var API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? DEFAULT_API_BASE;
async function fetchJson(path, init) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers ?? {}
    },
    cache: "no-store"
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}
async function fetchCourses() {
  return fetchJson("/courses");
}
async function fetchCourse(id) {
  return fetchJson(`/courses/${id}`);
}
async function fetchCourseContent(id, address) {
  const res = await fetchJson(`/courses/${id}/content?address=${address}`);
  return res.content;
}
async function createCourse(input) {
  return fetchJson("/courses", {
    method: "POST",
    body: JSON.stringify(input)
  });
}
async function updateCourse(id, input, token) {
  return fetchJson(`/courses/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(input)
  });
}
async function unpublishCourse(id, token) {
  return fetchJson(`/courses/${id}/unpublish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
async function requestPublishCourse(id, token) {
  return fetchJson(`/courses/${id}/request-publish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
async function recordPurchase(input) {
  return fetchJson("/hooks/purchase", {
    method: "POST",
    headers: input.token ? {
      Authorization: `Bearer ${input.token}`
    } : void 0,
    body: JSON.stringify(input)
  });
}
async function requestAuthChallenge(address) {
  return fetchJson("/auth/challenge", {
    method: "POST",
    body: JSON.stringify({ address })
  });
}
async function verifyAuthSignature(input) {
  return fetchJson("/auth/verify", {
    method: "POST",
    body: JSON.stringify(input)
  });
}
async function fetchMe(token) {
  return fetchJson("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
async function adminApproveCourse(id, token) {
  return fetchJson(`/admin/courses/${id}/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
async function adminUnpublishCourse(id, token) {
  return fetchJson(`/admin/courses/${id}/unpublish`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
async function adminFreezeUser(address, token) {
  return fetchJson(`/admin/users/${address}/freeze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

// ../../apps/contracts/exports/31337.json
var __default = {
  chainId: 31337,
  network: "localhost",
  addresses: {
    YDToken: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    CourseCertificate: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    Courses: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    Exchange: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
  },
  abis: {
    YDToken: [
      {
        inputs: [
          {
            internalType: "string",
            name: "name_",
            type: "string"
          },
          {
            internalType: "string",
            name: "symbol_",
            type: "string"
          },
          {
            internalType: "uint8",
            name: "decimals_",
            type: "uint8"
          },
          {
            internalType: "uint256",
            name: "initialSupply",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "initialOwner",
            type: "address"
          }
        ],
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "spender",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "allowance",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "needed",
            type: "uint256"
          }
        ],
        name: "ERC20InsufficientAllowance",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "sender",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "balance",
            type: "uint256"
          },
          {
            internalType: "uint256",
            name: "needed",
            type: "uint256"
          }
        ],
        name: "ERC20InsufficientBalance",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "approver",
            type: "address"
          }
        ],
        name: "ERC20InvalidApprover",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "receiver",
            type: "address"
          }
        ],
        name: "ERC20InvalidReceiver",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "sender",
            type: "address"
          }
        ],
        name: "ERC20InvalidSender",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "spender",
            type: "address"
          }
        ],
        name: "ERC20InvalidSpender",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address"
          }
        ],
        name: "OwnableInvalidOwner",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "account",
            type: "address"
          }
        ],
        name: "OwnableUnauthorizedAccount",
        type: "error"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "owner",
            type: "address"
          },
          {
            indexed: true,
            internalType: "address",
            name: "spender",
            type: "address"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "value",
            type: "uint256"
          }
        ],
        name: "Approval",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "previousOwner",
            type: "address"
          },
          {
            indexed: true,
            internalType: "address",
            name: "newOwner",
            type: "address"
          }
        ],
        name: "OwnershipTransferred",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address"
          },
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "value",
            type: "uint256"
          }
        ],
        name: "Transfer",
        type: "event"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address"
          },
          {
            internalType: "address",
            name: "spender",
            type: "address"
          }
        ],
        name: "allowance",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "spender",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256"
          }
        ],
        name: "approve",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool"
          }
        ],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "account",
            type: "address"
          }
        ],
        name: "balanceOf",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [
          {
            internalType: "uint8",
            name: "",
            type: "uint8"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256"
          }
        ],
        name: "mint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [],
        name: "name",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "owner",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [],
        name: "symbol",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "totalSupply",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256"
          }
        ],
        name: "transfer",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool"
          }
        ],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "from",
            type: "address"
          },
          {
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "value",
            type: "uint256"
          }
        ],
        name: "transferFrom",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool"
          }
        ],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "newOwner",
            type: "address"
          }
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      }
    ],
    Courses: [
      {
        inputs: [
          {
            internalType: "address",
            name: "tokenAddress",
            type: "address"
          },
          {
            internalType: "address",
            name: "certificateAddress",
            type: "address"
          },
          {
            internalType: "address",
            name: "initialOwner",
            type: "address"
          },
          {
            internalType: "address",
            name: "initialFeeRecipient",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "initialFeeBps",
            type: "uint256"
          }
        ],
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address"
          }
        ],
        name: "OwnableInvalidOwner",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "account",
            type: "address"
          }
        ],
        name: "OwnableUnauthorizedAccount",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "token",
            type: "address"
          }
        ],
        name: "SafeERC20FailedOperation",
        type: "error"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "certificate",
            type: "address"
          }
        ],
        name: "CertificateUpdated",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "string",
            name: "courseId",
            type: "string"
          },
          {
            indexed: true,
            internalType: "address",
            name: "author",
            type: "address"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "price",
            type: "uint256"
          }
        ],
        name: "CourseCreated",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "string",
            name: "courseId",
            type: "string"
          },
          {
            indexed: true,
            internalType: "address",
            name: "student",
            type: "address"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "price",
            type: "uint256"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "fee",
            type: "uint256"
          }
        ],
        name: "CoursePurchased",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "feeRecipient",
            type: "address"
          }
        ],
        name: "FeeRecipientUpdated",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "previousOwner",
            type: "address"
          },
          {
            indexed: true,
            internalType: "address",
            name: "newOwner",
            type: "address"
          }
        ],
        name: "OwnershipTransferred",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "feeBps",
            type: "uint256"
          }
        ],
        name: "PlatformFeeUpdated",
        type: "event"
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "courseId",
            type: "string"
          }
        ],
        name: "buyCourse",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [],
        name: "certificate",
        outputs: [
          {
            internalType: "contract ICourseCertificate",
            name: "",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "courseId",
            type: "string"
          }
        ],
        name: "courseInfo",
        outputs: [
          {
            components: [
              {
                internalType: "address",
                name: "author",
                type: "address"
              },
              {
                internalType: "uint256",
                name: "price",
                type: "uint256"
              },
              {
                internalType: "bool",
                name: "exists",
                type: "bool"
              }
            ],
            internalType: "struct Courses.Course",
            name: "",
            type: "tuple"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "courseId",
            type: "string"
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "author",
            type: "address"
          }
        ],
        name: "createCourse",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [],
        name: "feeRecipient",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "string",
            name: "courseId",
            type: "string"
          },
          {
            internalType: "address",
            name: "student",
            type: "address"
          }
        ],
        name: "hasPurchased",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "owner",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "platformFeeBps",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "newCertificate",
            type: "address"
          }
        ],
        name: "setCertificate",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "newRecipient",
            type: "address"
          }
        ],
        name: "setFeeRecipient",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "newFeeBps",
            type: "uint256"
          }
        ],
        name: "setPlatformFeeBps",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "newOwner",
            type: "address"
          }
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [],
        name: "ydToken",
        outputs: [
          {
            internalType: "contract IERC20",
            name: "",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      }
    ],
    CourseCertificate: [
      {
        inputs: [
          {
            internalType: "address",
            name: "initialOwner",
            type: "address"
          }
        ],
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "sender",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "owner",
            type: "address"
          }
        ],
        name: "ERC721IncorrectOwner",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "operator",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          }
        ],
        name: "ERC721InsufficientApproval",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "approver",
            type: "address"
          }
        ],
        name: "ERC721InvalidApprover",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "operator",
            type: "address"
          }
        ],
        name: "ERC721InvalidOperator",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address"
          }
        ],
        name: "ERC721InvalidOwner",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "receiver",
            type: "address"
          }
        ],
        name: "ERC721InvalidReceiver",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "sender",
            type: "address"
          }
        ],
        name: "ERC721InvalidSender",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          }
        ],
        name: "ERC721NonexistentToken",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address"
          }
        ],
        name: "OwnableInvalidOwner",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "account",
            type: "address"
          }
        ],
        name: "OwnableUnauthorizedAccount",
        type: "error"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "owner",
            type: "address"
          },
          {
            indexed: true,
            internalType: "address",
            name: "approved",
            type: "address"
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          }
        ],
        name: "Approval",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "owner",
            type: "address"
          },
          {
            indexed: true,
            internalType: "address",
            name: "operator",
            type: "address"
          },
          {
            indexed: false,
            internalType: "bool",
            name: "approved",
            type: "bool"
          }
        ],
        name: "ApprovalForAll",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "student",
            type: "address"
          },
          {
            indexed: false,
            internalType: "string",
            name: "courseId",
            type: "string"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          }
        ],
        name: "CertificateIssued",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "minter",
            type: "address"
          }
        ],
        name: "MinterUpdated",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "previousOwner",
            type: "address"
          },
          {
            indexed: true,
            internalType: "address",
            name: "newOwner",
            type: "address"
          }
        ],
        name: "OwnershipTransferred",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address"
          },
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            indexed: true,
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          }
        ],
        name: "Transfer",
        type: "event"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          }
        ],
        name: "approve",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address"
          }
        ],
        name: "balanceOf",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          }
        ],
        name: "certificateData",
        outputs: [
          {
            components: [
              {
                internalType: "string",
                name: "courseId",
                type: "string"
              },
              {
                internalType: "uint256",
                name: "issuedAt",
                type: "uint256"
              }
            ],
            internalType: "struct CourseCertificate.CertificateData",
            name: "",
            type: "tuple"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          }
        ],
        name: "getApproved",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address"
          },
          {
            internalType: "address",
            name: "operator",
            type: "address"
          }
        ],
        name: "isApprovedForAll",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            internalType: "string",
            name: "courseId",
            type: "string"
          }
        ],
        name: "mintCertificate",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256"
          }
        ],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [],
        name: "minter",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "name",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "nextTokenId",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "owner",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          }
        ],
        name: "ownerOf",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "from",
            type: "address"
          },
          {
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          }
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "from",
            type: "address"
          },
          {
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes"
          }
        ],
        name: "safeTransferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "operator",
            type: "address"
          },
          {
            internalType: "bool",
            name: "approved",
            type: "bool"
          }
        ],
        name: "setApprovalForAll",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "newMinter",
            type: "address"
          }
        ],
        name: "setMinter",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "bytes4",
            name: "interfaceId",
            type: "bytes4"
          }
        ],
        name: "supportsInterface",
        outputs: [
          {
            internalType: "bool",
            name: "",
            type: "bool"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "symbol",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          }
        ],
        name: "tokenURI",
        outputs: [
          {
            internalType: "string",
            name: "",
            type: "string"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "from",
            type: "address"
          },
          {
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256"
          }
        ],
        name: "transferFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "newOwner",
            type: "address"
          }
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      }
    ],
    Exchange: [
      {
        inputs: [
          {
            internalType: "address",
            name: "tokenAddress",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "rate_",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "feeRecipient_",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "feeBps_",
            type: "uint256"
          },
          {
            internalType: "address",
            name: "owner",
            type: "address"
          }
        ],
        stateMutability: "nonpayable",
        type: "constructor"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address"
          }
        ],
        name: "OwnableInvalidOwner",
        type: "error"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "account",
            type: "address"
          }
        ],
        name: "OwnableUnauthorizedAccount",
        type: "error"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "newFeeBps",
            type: "uint256"
          }
        ],
        name: "FeeBpsUpdated",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "newRecipient",
            type: "address"
          }
        ],
        name: "FeeRecipientUpdated",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "previousOwner",
            type: "address"
          },
          {
            indexed: true,
            internalType: "address",
            name: "newOwner",
            type: "address"
          }
        ],
        name: "OwnershipTransferred",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "newRate",
            type: "uint256"
          }
        ],
        name: "RateUpdated",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "ethIn",
            type: "uint256"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "ydOut",
            type: "uint256"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "fee",
            type: "uint256"
          }
        ],
        name: "SwappedEthToYd",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "ydIn",
            type: "uint256"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "ethOut",
            type: "uint256"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "fee",
            type: "uint256"
          }
        ],
        name: "SwappedYdToEth",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256"
          }
        ],
        name: "WithdrawEth",
        type: "event"
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256"
          }
        ],
        name: "WithdrawYd",
        type: "event"
      },
      {
        inputs: [],
        name: "feeBps",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "feeRecipient",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "owner",
        outputs: [
          {
            internalType: "address",
            name: "",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "rate",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "newFeeBps",
            type: "uint256"
          }
        ],
        name: "setFeeBps",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "newRecipient",
            type: "address"
          }
        ],
        name: "setFeeRecipient",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "newRate",
            type: "uint256"
          }
        ],
        name: "setRate",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [],
        name: "swapEthToYd",
        outputs: [],
        stateMutability: "payable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "uint256",
            name: "ydAmount",
            type: "uint256"
          }
        ],
        name: "swapYdToEth",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "newOwner",
            type: "address"
          }
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address payable",
            name: "to",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256"
          }
        ],
        name: "withdrawEth",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "to",
            type: "address"
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256"
          }
        ],
        name: "withdrawYd",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      },
      {
        inputs: [],
        name: "ydToken",
        outputs: [
          {
            internalType: "contract IERC20",
            name: "",
            type: "address"
          }
        ],
        stateMutability: "view",
        type: "function"
      },
      {
        stateMutability: "payable",
        type: "receive"
      }
    ]
  }
};

// src/contracts.ts
var contracts = __default;

// src/data/courses.seed.json
var courses_seed_default = [
  {
    id: "defi-101",
    title: "Introduction to DeFi",
    description: "Build a DeFi foundation with yield farming, AMMs, and staking basics.",
    priceYd: "800",
    authorAddress: "0x1234...ABCD",
    owned: true,
    progress: 72
  },
  {
    id: "solidity-core",
    title: "Solidity Smart Contracts",
    description: "Learn secure contract patterns and gas optimization.",
    priceYd: "500",
    authorAddress: "0x5678...EFGH",
    owned: false,
    progress: 0
  },
  {
    id: "nft-market",
    title: "NFT Marketplace Architecture",
    description: "Design ERC-721 marketplaces with auctions and royalties.",
    priceYd: "1200",
    authorAddress: "0x90AB...CDEF",
    owned: true,
    progress: 40
  }
];

// src/courses.ts
var courseList = courses_seed_default;
function getCourses() {
  return courseList;
}
function getCourseById(id) {
  const found = courseList.find((course) => course.id === id);
  if (!found) {
    return null;
  }
  return {
    ...found,
    content: found.owned ? "Course content unlocked. Explore modules, assignments, and community resources." : null
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  API_BASE,
  adminApproveCourse,
  adminFreezeUser,
  adminUnpublishCourse,
  contracts,
  createCourse,
  fetchCourse,
  fetchCourseContent,
  fetchCourses,
  fetchMe,
  getCourseById,
  getCourses,
  recordPurchase,
  requestAuthChallenge,
  requestPublishCourse,
  unpublishCourse,
  updateCourse,
  verifyAuthSignature
});
