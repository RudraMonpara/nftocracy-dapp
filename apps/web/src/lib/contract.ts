import { Contract, type ContractRunner } from 'ethers';
import { getAddress, parseAbi, type Address } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

/** Voting + ERC-1155 reads target Arbitrum Sepolia. */
export const VOTING_CHAIN = arbitrumSepolia;
export const VOTING_CHAIN_ID = arbitrumSepolia.id;

/**
 * Human-readable signatures shared by wagmi (via parseAbi) and ethers `Contract`.
 * Must match the deployed contract. `hasVoted` is required for safe “Vote” UX;
 * use a `public mapping(uint256 => mapping(address => bool)) hasVoted` (or equivalent getter).
 */
export const VOTING_ABI_SIGNATURES = [
  'function proposalCount() view returns (uint256)',
  'function proposals(uint256 proposalId) view returns (string description, uint256 voteCount, uint256 deadline)',
  'function getVotingPower(address account) view returns (uint256)',
  'function createProposal(string description, uint256 duration)',
  'function vote(uint256 proposalId)',
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function hasVoted(uint256 proposalId, address voter) view returns (bool)',
] as const satisfies readonly string[];

export const VOTING_ABI = parseAbi([...VOTING_ABI_SIGNATURES]);

export function getVotingContractAddress(): Address {
  const raw = process.env.NEXT_PUBLIC_ERC1155_ADDRESS?.trim();
  if (!raw) {
    throw new Error(
      'NEXT_PUBLIC_ERC1155_ADDRESS is not set. Add your deployed contract address to apps/web/.env.',
    );
  }
  return getAddress(raw);
}

export function tryGetVotingContractAddress(): Address | undefined {
  try {
    return getVotingContractAddress();
  } catch {
    return undefined;
  }
}

/** Ethers v6 contract bound to the configured voting / ERC-1155 address. */
export function getEthersVotingContract(runner: ContractRunner) {
  return new Contract(
    getVotingContractAddress(),
    [...VOTING_ABI_SIGNATURES],
    runner,
  );
}
