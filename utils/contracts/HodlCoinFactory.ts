const HodlCoinFactory = {
  "abi": [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "_initialOwner",
          "type": "address",
          "internalType": "address"
        }
      ],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "createHodlCoin",
      "inputs": [
        { "name": "coinName", "type": "string", "internalType": "string" },
        { "name": "symbol", "type": "string", "internalType": "string" },
        { "name": "_coin", "type": "address", "internalType": "address" },
        { "name": "_vaultCreator", "type": "address", "internalType": "address" },
        { "name": "_vaultFee", "type": "uint256", "internalType": "uint256" },
        { "name": "_vaultCreatorFee", "type": "uint256", "internalType": "uint256" },
        { "name": "_stableOrderFee", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "addInteraction",
      "inputs": [
        { "name": "user", "type": "address", "internalType": "address" },
        { "name": "vault", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "removeInteraction",
      "inputs": [
        { "name": "vault", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "getCreatorVaultsSlice",
      "inputs": [
        { "name": "creator", "type": "address", "internalType": "address" },
        { "name": "start", "type": "uint256", "internalType": "uint256" },
        { "name": "end", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "address[]", "internalType": "address[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getUserInteractedVaultsSlice",
      "inputs": [
        { "name": "user", "type": "address", "internalType": "address" },
        { "name": "start", "type": "uint256", "internalType": "uint256" },
        { "name": "end", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "address[]", "internalType": "address[]" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "getVaultsSlice",
      "inputs": [
        { "name": "start", "type": "uint256", "internalType": "uint256" },
        { "name": "end", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { 
          "name": "", 
          "type": "tuple[]", 
          "internalType": "struct HodlCoinFactory.Vault[]",
          "components": [
            { "name": "vaultAddress", "type": "address", "internalType": "address" },
            { "name": "coinName", "type": "string", "internalType": "string" },
            { "name": "coinAddress", "type": "address", "internalType": "address" },
            { "name": "coinSymbol", "type": "string", "internalType": "string" }
          ]
        }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "vaults",
      "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "outputs": [
        { "name": "vaultAddress", "type": "address", "internalType": "address" },
        { "name": "coinName", "type": "string", "internalType": "string" },
        { "name": "coinAddress", "type": "address", "internalType": "address" },
        { "name": "coinSymbol", "type": "string", "internalType": "string" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "isValidVault",
      "inputs": [
        { "name": "", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        { "name": "", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "creatorToVaults",
      "inputs": [
        { "name": "", "type": "address", "internalType": "address" },
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "creatorVaultCount",
      "inputs": [
        { "name": "", "type": "address", "internalType": "address" }
      ],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "userInteractedVaultsHistory",
      "inputs": [
        { "name": "", "type": "address", "internalType": "address" },
        { "name": "", "type": "address", "internalType": "address" }
      ],
      "outputs": [
        { "name": "", "type": "bool", "internalType": "bool" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "userInteractedVaults",
      "inputs": [
        { "name": "", "type": "address", "internalType": "address" },
        { "name": "", "type": "uint256", "internalType": "uint256" }
      ],
      "outputs": [
        { "name": "", "type": "address", "internalType": "address" }
      ],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "vaultId",
      "inputs": [],
      "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "owner",
      "inputs": [],
      "outputs": [{ "name": "", "type": "address", "internalType": "address" }],
      "stateMutability": "view"
    },
    {
      "type": "function",
      "name": "renounceOwnership",
      "inputs": [],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "function",
      "name": "transferOwnership",
      "inputs": [
        { "name": "newOwner", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    },
    {
      "type": "event",
      "name": "HodlCoinCreated",
      "inputs": [
        {
          "name": "hodlCoin",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "creator",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "coin",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "UserVaultInteracted",
      "inputs": [
        {
          "name": "user",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "vault",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "UserVaultInteractionRemoved",
      "inputs": [
        {
          "name": "user",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "vault",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    {
      "type": "event",
      "name": "OwnershipTransferred",
      "inputs": [
        {
          "name": "previousOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        },
        {
          "name": "newOwner",
          "type": "address",
          "indexed": true,
          "internalType": "address"
        }
      ],
      "anonymous": false
    },
    { "type": "error", "name": "HodlCoinFactory_InvalidIndex", "inputs": [] },
    {
      "type": "error",
      "name": "OwnableInvalidOwner",
      "inputs": [
        { "name": "owner", "type": "address", "internalType": "address" }
      ]
    },
    {
      "type": "error",
      "name": "OwnableUnauthorizedAccount",
      "inputs": [
        { "name": "account", "type": "address", "internalType": "address" }
      ]
    }
  ]
} as const;

export const HodlCoinFactoryAbi = HodlCoinFactory.abi;