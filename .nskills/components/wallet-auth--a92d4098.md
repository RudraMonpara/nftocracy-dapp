# Wallet Auth

| Field | Value |
|-------|-------|
| Type | `wallet-auth` |
| ID | `a92d4098` |
| Category | app |
| Tags | auth, wallet, siwe, login, web3 |
| Description | WalletConnect, social login, SIWE |

## User's Intent

> Configure wallet authentication for a Web3 DApp using MetaMask.
> 
> Requirements:
> 
> 1. Use RainbowKit for wallet connection
> 2. Ensure MetaMask is supported and prioritized
> 3. Display connected wallet address (shortened format like 0x123...abc)
> 4. Show current network (Arbitrum Sepolia)
> 
> 5. Add network validation:
>    - If user is NOT on Arbitrum Sepolia, show warning
>    - Provide button to switch network
> 
> 6. Show connection status:
>    - Not connected
>    - Connecting
>    - Connected
> 
> 7. Add disconnect button
> 
> 8. After connection:
>    - Automatically fetch user NFT balances from ERC-1155 contract
>    - Store wallet address globally for contract interaction
> 
> 9. Handle errors:
>    - User rejects connection
>    - Wallet not installed
> 
> 10. UI:
>    - Clean connect button
>    - Show wallet info in top navbar
> 
> Use wagmi + ethers.js internally.

## Configuration

| Setting | Value |
|---------|-------|
| Provider | rainbowkit |
| Wallet Connect Enabled | Enabled |
| Siwe Enabled | Enabled |
| Social Logins | (none) |
| Session Persistence | Enabled |
| App Name | NFTocracy |

## Environment Variables

| Key | Description | Required | Secret | Default |
|-----|-------------|----------|--------|---------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud project ID | Yes | No |  |
| `NEXT_PUBLIC_APP_NAME` | Application name for wallet dialogs | No | No | NFTocracy |

## Scripts

| Name | Command |
|------|---------|
| `wallet:setup` | `echo "Get your WalletConnect Project ID from https://dashboard.reown.com"` |

## Integration Points

**Depends on:**
- Frontend-scaffold (`d8e89ce6`)

