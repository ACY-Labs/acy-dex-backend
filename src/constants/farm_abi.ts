export default [
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "poolId",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "bytes32",
                name: "token",
                type: "bytes32"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newAllocPoint",
                type: "uint256"
            }
        ],
        name: "AllocPointUpdated",
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
                indexed: true,
                internalType: "uint256",
                name: "poolId",
                type: "uint256"
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "positionId",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "Deposit",
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
                indexed: true,
                internalType: "uint256",
                name: "poolId",
                type: "uint256"
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "positionId",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "bytes32",
                name: "token",
                type: "bytes32"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "Harvest",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "uint256",
                name: "poolId",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "address",
                name: "lpToken",
                type: "address"
            }
        ],
        name: "NewPool",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "token",
                type: "bytes32"
            },
            {
                indexed: false,
                internalType: "address",
                name: "addr",
                type: "address"
            }
        ],
        name: "NewToken",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "account",
                type: "address"
            }
        ],
        name: "Paused",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "bytes32",
                name: "token",
                type: "bytes32"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "newReward",
                type: "uint256"
            }
        ],
        name: "RewardPerBlockUpdated",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "previousAdminRole",
                type: "bytes32"
            },
            {
                indexed: true,
                internalType: "bytes32",
                name: "newAdminRole",
                type: "bytes32"
            }
        ],
        name: "RoleAdminChanged",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address"
            }
        ],
        name: "RoleGranted",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                indexed: true,
                internalType: "address",
                name: "account",
                type: "address"
            },
            {
                indexed: true,
                internalType: "address",
                name: "sender",
                type: "address"
            }
        ],
        name: "RoleRevoked",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "token",
                type: "bytes32"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "TokenFunded",
        type: "event"
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "account",
                type: "address"
            }
        ],
        name: "Unpaused",
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
                indexed: true,
                internalType: "uint256",
                name: "poolId",
                type: "uint256"
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "positionId",
                type: "uint256"
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256"
            }
        ],
        name: "Withdraw",
        type: "event"
    },
    {
        inputs: [],
        name: "DEFAULT_ADMIN_ROLE",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "PAUSER_ROLE",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "POOL_MANAGER_ROLE",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [],
        name: "WHITELISTER_ROLE",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            }
        ],
        name: "availableBalance",
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
                internalType: "contract IERC20",
                name: "_lpToken",
                type: "address"
            },
            {
                internalType: "bytes32[]",
                name: "_rewardTokens",
                type: "bytes32[]"
            },
            {
                internalType: "uint256[]",
                name: "_allocPoints",
                type: "uint256[]"
            },
            {
                internalType: "uint256",
                name: "_startBlock",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_endBlock",
                type: "uint256"
            },
            {
                internalType: "bool",
                name: "_withUpdate",
                type: "bool"
            }
        ],
        name: "createPool",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_poolId",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_lockDuration",
                type: "uint256"
            }
        ],
        name: "deposit",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "addr",
                type: "address"
            }
        ],
        name: "disableSponsorshipForAddress",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "addr",
                type: "address"
            }
        ],
        name: "enableSponsorshipForAddress",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "_token",
                type: "bytes32"
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256"
            }
        ],
        name: "fund",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_poolId",
                type: "uint256"
            },
            {
                internalType: "bytes32",
                name: "_token",
                type: "bytes32"
            }
        ],
        name: "getAccTokenPerShare",
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
                name: "_poolId",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_id",
                type: "uint256"
            },
            {
                internalType: "bytes32",
                name: "_token",
                type: "bytes32"
            }
        ],
        name: "getPendingRewards",
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
                name: "_poolId",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_index",
                type: "uint256"
            }
        ],
        name: "getPoolPositionIdAt",
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
                name: "_poolId",
                type: "uint256"
            }
        ],
        name: "getPoolPositions",
        outputs: [
            {
                internalType: "uint256[]",
                name: "",
                type: "uint256[]"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_poolId",
                type: "uint256"
            }
        ],
        name: "getPoolRewardTokenAddresses",
        outputs: [
            {
                internalType: "address[]",
                name: "addresses",
                type: "address[]"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_poolId",
                type: "uint256"
            }
        ],
        name: "getPoolRewardTokens",
        outputs: [
            {
                internalType: "bytes32[]",
                name: "",
                type: "bytes32[]"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_poolId",
                type: "uint256"
            },
            {
                internalType: "bytes32",
                name: "_token",
                type: "bytes32"
            }
        ],
        name: "getPoolTokenRewardInfo",
        outputs: [
            {
                internalType: "uint256",
                name: "ap",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "totalAp",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "tokenPerBlock",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "tokenInPoolPerBlock",
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
                name: "_poolId",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_id",
                type: "uint256"
            },
            {
                internalType: "bytes32",
                name: "_token",
                type: "bytes32"
            }
        ],
        name: "getRewardDebt",
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
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            }
        ],
        name: "getRoleAdmin",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                internalType: "uint256",
                name: "index",
                type: "uint256"
            }
        ],
        name: "getRoleMember",
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
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            }
        ],
        name: "getRoleMemberCount",
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
                name: "_poolId",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_id",
                type: "uint256"
            },
            {
                internalType: "bytes32",
                name: "_token",
                type: "bytes32"
            }
        ],
        name: "getTotalRewards",
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
                name: "_addr",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "_poolId",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_index",
                type: "uint256"
            }
        ],
        name: "getUserPositionIdAt",
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
                name: "_addr",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "_poolId",
                type: "uint256"
            }
        ],
        name: "getUserPositions",
        outputs: [
            {
                internalType: "uint256[]",
                name: "",
                type: "uint256[]"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                internalType: "address",
                name: "account",
                type: "address"
            }
        ],
        name: "grantRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_poolId",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_positionId",
                type: "uint256"
            },
            {
                internalType: "bool",
                name: "_closeIfEmpty",
                type: "bool"
            },
            {
                internalType: "bool",
                name: "_revertOnFailure",
                type: "bool"
            }
        ],
        name: "harvest",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_poolId",
                type: "uint256"
            },
            {
                internalType: "bool",
                name: "_closeIfEmpty",
                type: "bool"
            },
            {
                internalType: "bool",
                name: "_revertOnFailure",
                type: "bool"
            }
        ],
        name: "harvestAll",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                internalType: "address",
                name: "account",
                type: "address"
            }
        ],
        name: "hasRole",
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
        name: "massUpdatePools",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_poolId",
                type: "uint256"
            }
        ],
        name: "numPoolPositions",
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
        name: "numPools",
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
        name: "numPositions",
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
                name: "_addr",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "_poolId",
                type: "uint256"
            }
        ],
        name: "numUserPositions",
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
        name: "pause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [],
        name: "paused",
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
                internalType: "uint256",
                name: "_poolId",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_id",
                type: "uint256"
            },
            {
                internalType: "bytes32",
                name: "_token",
                type: "bytes32"
            }
        ],
        name: "pending",
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
                name: "",
                type: "uint256"
            }
        ],
        name: "poolInfo",
        outputs: [
            {
                internalType: "contract IERC20",
                name: "lpToken",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "lpBalance",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "totalLpScore",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "lastUpdateBlock",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "startBlock",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "endBlock",
                type: "uint256"
            },
            {
                internalType: "bool",
                name: "exists",
                type: "bool"
            }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "_token",
                type: "bytes32"
            },
            {
                internalType: "contract IERC20",
                name: "_erc20",
                type: "address"
            }
        ],
        name: "registerToken",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                internalType: "address",
                name: "account",
                type: "address"
            }
        ],
        name: "renounceRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "role",
                type: "bytes32"
            },
            {
                internalType: "address",
                name: "account",
                type: "address"
            }
        ],
        name: "revokeRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            }
        ],
        name: "rewardPerBlock",
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
                name: "_poolId",
                type: "uint256"
            },
            {
                internalType: "bytes32",
                name: "_token",
                type: "bytes32"
            },
            {
                internalType: "uint256",
                name: "_allocPoint",
                type: "uint256"
            },
            {
                internalType: "bool",
                name: "_withUpdate",
                type: "bool"
            }
        ],
        name: "setAllocPoint",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "_token",
                type: "bytes32"
            },
            {
                internalType: "uint256",
                name: "_newReward",
                type: "uint256"
            },
            {
                internalType: "bool",
                name: "_withUpdate",
                type: "bool"
            }
        ],
        name: "setRewardPerBlock",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "",
                type: "uint256"
            }
        ],
        name: "stakingPosition",
        outputs: [
            {
                internalType: "address",
                name: "addr",
                type: "address"
            },
            {
                internalType: "uint256",
                name: "lpAmount",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "stakeTimestamp",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "lockDuration",
                type: "uint256"
            },
            {
                internalType: "bool",
                name: "exists",
                type: "bool"
            }
        ],
        stateMutability: "view",
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
        inputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            }
        ],
        name: "tokenContract",
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
        inputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32"
            }
        ],
        name: "totalAllocPoint",
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
        name: "unpause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_poolId",
                type: "uint256"
            }
        ],
        name: "updatePool",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_poolId",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_positionId",
                type: "uint256"
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256"
            }
        ],
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    }
]