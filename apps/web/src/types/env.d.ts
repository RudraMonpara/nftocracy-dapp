declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: string;
    NEXT_PUBLIC_APP_NAME?: string;
    /** Voting + ERC-1155 contract on Arbitrum Sepolia */
    NEXT_PUBLIC_ERC1155_ADDRESS?: string;
    NEXT_PUBLIC_CONTRACT_ADDRESS?: string;
  }
}
