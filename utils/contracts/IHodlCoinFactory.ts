const IHodlCoinFactory = {
  "abi": [
    {
      "type": "function",
      "name": "addInteraction",
      "inputs": [
        { "name": "user", "type": "address", "internalType": "address" },
        { "name": "vault", "type": "address", "internalType": "address" }
      ],
      "outputs": [],
      "stateMutability": "nonpayable"
    }
  ]
} as const;

export const IHodlCoinFactoryAbi = IHodlCoinFactory.abi; 