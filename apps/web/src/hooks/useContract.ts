'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import {
  getVotingContractAddress,
  tryGetVotingContractAddress,
  VOTING_ABI,
  VOTING_CHAIN_ID,
} from '@/lib/contract';

export type ProposalRow = {
  id: number;
  description: string;
  voteCount: bigint;
  deadline: bigint;
  hasVoted: boolean;
  voteStatusError: boolean;
  deadlinePassed: boolean;
  canVote: boolean;
};

export type UseContractOptions = {
  /** When false, skips batched proposal + hasVoted reads (lighter dashboard / create flows). */
  withProposals?: boolean;
};

const MAX_PROPOSALS_BATCH = 200;

function invalidateVotingReads(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ['readContract'] });
  void queryClient.invalidateQueries({ queryKey: ['readContracts'] });
}

export function useContract(options?: UseContractOptions) {
  const withProposals = options?.withProposals ?? false;
  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const contractAddress = tryGetVotingContractAddress();
  const configError = useMemo(() => {
    try {
      getVotingContractAddress();
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Invalid contract configuration';
    }
  }, []);

  const isArbitrumSepolia = chainId === VOTING_CHAIN_ID;

  const switchToArbitrumSepolia = useCallback(async () => {
    if (!switchChainAsync) {
      throw new Error('This wallet cannot switch chains from the app.');
    }
    await switchChainAsync({ chainId: VOTING_CHAIN_ID });
  }, [switchChainAsync]);

  const readEnabled = !!contractAddress;

  const {
    data: proposalCount,
    isLoading: isLoadingCount,
    refetch: refetchProposalCount,
  } = useReadContract({
    address: contractAddress,
    abi: VOTING_ABI,
    functionName: 'proposalCount',
    chainId: VOTING_CHAIN_ID,
    query: { enabled: readEnabled },
  });

  const countNum = useMemo(() => {
    if (proposalCount === undefined) return 0;
    const n = Number(proposalCount);
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.min(n, MAX_PROPOSALS_BATCH);
  }, [proposalCount]);

  const proposalReads = useMemo(() => {
    if (!contractAddress || !withProposals || countNum === 0) return [];
    return Array.from({ length: countNum }, (_, i) => ({
      address: contractAddress,
      abi: VOTING_ABI,
      functionName: 'proposals' as const,
      args: [BigInt(i)] as const,
      chainId: VOTING_CHAIN_ID,
    }));
  }, [contractAddress, withProposals, countNum]);

  const {
    data: proposalsRaw,
    isLoading: isLoadingProposals,
    isFetching: isFetchingProposals,
    refetch: refetchProposals,
  } = useReadContracts({
    contracts: proposalReads,
    query: {
      enabled: readEnabled && withProposals && proposalReads.length > 0,
    },
  });

  const votedReads = useMemo(() => {
    if (!contractAddress || !withProposals || !address || countNum === 0) return [];
    return Array.from({ length: countNum }, (_, i) => ({
      address: contractAddress,
      abi: VOTING_ABI,
      functionName: 'hasVoted' as const,
      args: [BigInt(i), address as `0x${string}`] as const,
      chainId: VOTING_CHAIN_ID,
    }));
  }, [contractAddress, withProposals, address, countNum]);

  const {
    data: votedRaw,
    isLoading: isLoadingVoted,
    isFetching: isFetchingVoted,
    refetch: refetchVoted,
  } = useReadContracts({
    contracts: votedReads,
    query: {
      enabled: readEnabled && withProposals && votedReads.length > 0,
    },
  });

  const proposals: ProposalRow[] = useMemo(() => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    if (!withProposals || countNum === 0) return [];
    const rows: ProposalRow[] = [];
    for (let i = 0; i < countNum; i++) {
      const pr = proposalsRaw?.[i];
      const vr = votedRaw?.[i];

      if (!pr || pr.status !== 'success' || pr.result === undefined) {
        rows.push({
          id: i,
          description: '',
          voteCount: 0n,
          deadline: 0n,
          hasVoted: false,
          voteStatusError: true,
          deadlinePassed: true,
          canVote: false,
        });
        continue;
      }

      const tuple = pr.result as readonly [string, bigint, bigint];
      const description = tuple[0] ?? '';
      const voteCount = tuple[1] ?? 0n;
      const deadline = tuple[2] ?? 0n;

      const voteStatusError = !vr || vr.status !== 'success' || vr.result === undefined;
      const hasVoted = voteStatusError ? false : Boolean(vr.result);
      const deadlinePassed = deadline <= now;

      const canVote =
        isConnected &&
        isArbitrumSepolia &&
        !!contractAddress &&
        !deadlinePassed &&
        !hasVoted &&
        !voteStatusError;

      rows.push({
        id: i,
        description,
        voteCount,
        deadline,
        hasVoted,
        voteStatusError,
        deadlinePassed,
        canVote,
      });
    }
    return rows;
  }, [
    withProposals,
    countNum,
    proposalsRaw,
    votedRaw,
    isConnected,
    isArbitrumSepolia,
    contractAddress,
  ]);

  const {
    data: votingPower,
    isLoading: isLoadingVotingPower,
    refetch: refetchVotingPower,
  } = useReadContract({
    address: contractAddress,
    abi: VOTING_ABI,
    functionName: 'getVotingPower',
    args: address ? [address] : undefined,
    chainId: VOTING_CHAIN_ID,
    query: { enabled: readEnabled && !!address },
  });

  const {
    data: balanceToken1,
    isLoading: isLoadingB1,
    refetch: refetchB1,
  } = useReadContract({
    address: contractAddress,
    abi: VOTING_ABI,
    functionName: 'balanceOf',
    args: address ? [address, 1n] : undefined,
    chainId: VOTING_CHAIN_ID,
    query: { enabled: readEnabled && !!address },
  });

  const {
    data: balanceToken2,
    isLoading: isLoadingB2,
    refetch: refetchB2,
  } = useReadContract({
    address: contractAddress,
    abi: VOTING_ABI,
    functionName: 'balanceOf',
    args: address ? [address, 2n] : undefined,
    chainId: VOTING_CHAIN_ID,
    query: { enabled: readEnabled && !!address },
  });

  const {
    writeContractAsync,
    data: txHash,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (!isConfirmed || !txHash) return;
    invalidateVotingReads(queryClient);
    void refetchProposalCount();
    void refetchVotingPower();
    void refetchB1();
    void refetchB2();
    if (withProposals) {
      void refetchProposals();
      void refetchVoted();
    }
  }, [
    isConfirmed,
    txHash,
    queryClient,
    refetchProposalCount,
    refetchVotingPower,
    refetchB1,
    refetchB2,
    withProposals,
    refetchProposals,
    refetchVoted,
  ]);

  const vote = useCallback(
    async (proposalId: bigint) => {
      if (!contractAddress) throw new Error('Contract address is not configured');
      if (!isArbitrumSepolia) await switchToArbitrumSepolia();
      await writeContractAsync({
        address: contractAddress,
        abi: VOTING_ABI,
        functionName: 'vote',
        args: [proposalId],
        chainId: VOTING_CHAIN_ID,
      });
    },
    [
      contractAddress,
      isArbitrumSepolia,
      switchToArbitrumSepolia,
      writeContractAsync,
    ],
  );

  const createProposal = useCallback(
    async (description: string, durationSeconds: bigint) => {
      if (!contractAddress) throw new Error('Contract address is not configured');
      if (!isArbitrumSepolia) await switchToArbitrumSepolia();
      await writeContractAsync({
        address: contractAddress,
        abi: VOTING_ABI,
        functionName: 'createProposal',
        args: [description, durationSeconds],
        chainId: VOTING_CHAIN_ID,
      });
    },
    [
      contractAddress,
      isArbitrumSepolia,
      switchToArbitrumSepolia,
      writeContractAsync,
    ],
  );

  const refetchAll = useCallback(async () => {
    await refetchProposalCount();
    await refetchVotingPower();
    await refetchB1();
    await refetchB2();
    if (withProposals) {
      await refetchProposals();
      await refetchVoted();
    }
  }, [
    refetchProposalCount,
    refetchVotingPower,
    refetchB1,
    refetchB2,
    withProposals,
    refetchProposals,
    refetchVoted,
  ]);

  const readsPending =
    isLoadingCount ||
    isLoadingVotingPower ||
    isLoadingB1 ||
    isLoadingB2 ||
    (withProposals &&
      (isLoadingProposals || isLoadingVoted || isFetchingProposals || isFetchingVoted));

  return {
    contractAddress,
    configError,
    account: address,
    isConnected,
    chainId,
    isArbitrumSepolia,
    switchToArbitrumSepolia,

    proposalCount,
    isLoadingCount,
    refetchProposalCount,

    proposals,
    isLoadingProposals: withProposals && (isLoadingProposals || isLoadingVoted),
    refetchProposals,

    votingPower,
    balanceToken1,
    balanceToken2,
    readsPending,
    refetchAll,

    vote,
    createProposal,

    tx: {
      hash: txHash,
      isPending: isWritePending,
      isConfirming,
      isSuccess: isConfirmed,
      error: writeError,
      reset: resetWrite,
    },
  };
}
