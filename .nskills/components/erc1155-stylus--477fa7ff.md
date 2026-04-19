# ERC-1155 Multi-Token

| Field | Value |
|-------|-------|
| Type | `erc1155-stylus` |
| ID | `477fa7ff` |
| Category | contracts |
| Tags | multi-token, erc1155, stylus, arbitrum, gaming |
| Description | Deploy multi-token contract on Arbitrum Stylus |

## User's Intent

> Modify this ERC-1155 contract to create an NFT-based voting system.
> 
> Requirements:
> 
> 1. Add a Proposal struct:
>    - description (string)
>    - voteCount (uint256)
>    - deadline (uint256)
> 
> 2. Add a mapping:
>    mapping(uint256 => Proposal) public proposals;
> 
> 3. Track voting:
>    mapping(address => mapping(uint256 => bool)) public hasVoted;
> 
> 4. Add function createProposal(string memory description, uint256 duration):
>    - Only owner can call
>    - Set deadline = current time + duration
> 
> 5. Add voting function vote(uint256 proposalId):
>    - User must not have voted before
>    - Voting allowed only before deadline
>    - Check ERC-1155 balance:
>         if user has token ID 1 → 1 vote
>         if user has token ID 2 → 5 votes
>    - Increase voteCount
> 
> 6. Add function getVotingPower(address user):
>    - Return weighted voting power
> 
> 7. Prevent double voting
> 
> 8. Add event:
>    event Voted(address user, uint256 proposalId, uint256 weight);
> 
> Keep ERC-1155 functionality intact.

## Configuration

| Setting | Value |
|---------|-------|
| Collection Name | My Multi-Token Collection |
| Base Uri | https://api.example.com/metadata/ |
| Network | arbitrum-sepolia |
| Features | ownable, mintable, burnable, pausable, supply-tracking, batch-operations |
| Selected Functions | balance_of, balance_of_batch, set_approval_for_all, is_approved_for_all, safe_transfer_from, safe_batch_transfer_from |

## Environment Variables

| Key | Description | Required | Secret | Default |
|-----|-------------|----------|--------|---------|
| `NEXT_PUBLIC_ERC1155_ADDRESS` | Deployed ERC1155 multi-token address | No | No |  |
| `PRIVATE_KEY` | Private key for deployment and transactions | Yes | Yes |  |
| `ERC1155_DEPLOYMENT_API_URL` | URL of the ERC1155 deployment API | No | No | http://localhost:4002 |

## Scripts

| Name | Command |
|------|---------|
| `deploy:multitoken` | `ts-node scripts/deploy-erc1155.ts` |
| `multitoken:info` | `ts-node scripts/multitoken-info.ts` |

## Documentation

### ERC-1155 Multi-Token

# My Multi-Token Collection

An ERC-1155 multi-token deployed on Arbitrum Sepolia using Stylus.

## Collection Details

- **Name:** My Multi-Token Collection
- **Base URI:** https://api.example.com/metadata/
- **Network:** arbitrum-sepolia
- **Features:** ownable, mintable, burnable, pausable, supply-tracking, batch-operations

## Deployment

```bash
pnpm deploy:multitoken
```

This will deploy the multi-token contract and output the contract address.

## Usage

### Get Collection Info

```typescript
import { fetchCollectionInfo } from '@/lib/erc1155-multitoken';

const info = await fetchCollectionInfo();
console.log(info.name, info.baseUri);
```

### Check Balance

```typescript
import { fetchBalance } from '@/lib/erc1155-multitoken';

const balance = await fetchBalance('0x...', 1n); // Check balance of token ID 1
console.log(balance);
```

### Mint Tokens (Owner Only)

```typescript
import { mintTokens } from '@/lib/erc1155-multitoken';

await mintTokens('0x...', 1n, '100', privateKey); // Mint 100 of token ID 1
```

### Batch Mint

```typescript
import { mintTokensBatch } from '@/lib/erc1155-multitoken';

await mintTokensBatch('0x...', [1n, 2n, 3n], ['100', '50', '25'], privateKey);
```

### Transfer Tokens

Use the `safeTransferFrom` function through the interaction panel or SDK.

## Contract Features

- **ownable**: Enabled
- **mintable**: Enabled
- **burnable**: Enabled
- **pausable**: Enabled
- **supply-tracking**: Enabled
- **batch-operations**: Enabled

## ERC-1155 Standard

ERC-1155 is a multi-token standard that allows:
- Multiple token types (fungible and non-fungible) in a single contract
- Batch operations for efficiency
- Safe transfer mechanisms
- Metadata URIs per token type


## File Structure

This component would generate the following files:

- `deploy-erc1155.ts` (contract-scripts)
- `erc1155-multitoken.ts` (frontend-lib)
- `ERC1155MultiTokenPanel.tsx` (frontend-components)

## Integration Points

**Provides to:**
- Frontend-scaffold (`d8e89ce6`)

