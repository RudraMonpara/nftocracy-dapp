'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useContract } from '@/hooks/useContract';

function deadlineLabel(deadline: bigint) {
  if (deadline === 0n) return '—';
  const ms = Number(deadline) * 1000;
  if (!Number.isFinite(ms)) return String(deadline);
  return new Date(ms).toLocaleString();
}

export default function ProposalsPage() {
  const {
    configError,
    proposals,
    isLoadingProposals,
    proposalCount,
    isLoadingCount,
    isConnected,
    isArbitrumSepolia,
    switchToArbitrumSepolia,
    vote,
    tx,
    refetchAll,
  } = useContract({ withProposals: true });

  const [voteError, setVoteError] = useState<string | null>(null);

  const busy = tx.isPending || tx.isConfirming;

  const onVote = async (proposalId: number) => {
    setVoteError(null);
    tx.reset();
    try {
      await vote(BigInt(proposalId));
    } catch (e) {
      setVoteError(e instanceof Error ? e.message : 'Vote failed');
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Proposals</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {proposalCount !== undefined
              ? `${proposalCount.toString()} total on-chain`
              : 'Loading count…'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/create"
            className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-white"
          >
            Create proposal
          </Link>
          <button
            type="button"
            onClick={() => void refetchAll()}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            Refresh
          </button>
        </div>
      </div>

      {configError ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          {configError}
        </div>
      ) : isConnected && !isArbitrumSepolia ? (
        <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-6">
          <p className="text-sm text-zinc-300">
            Switch to Arbitrum Sepolia to vote and see live proposal state from your wallet.
          </p>
          <button
            type="button"
            onClick={() => void switchToArbitrumSepolia()}
            className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
          >
            Switch network
          </button>
        </div>
      ) : isLoadingCount || isLoadingProposals ? (
        <p className="text-sm text-zinc-500">Loading proposals…</p>
      ) : proposals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-10 text-center">
          <p className="text-zinc-400">No proposals yet.</p>
          <Link
            href="/create"
            className="mt-4 inline-block text-sm font-medium text-amber-400 hover:text-amber-300"
          >
            Create the first one →
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4">
          {proposals.map((p) => {
            const disabled =
              busy ||
              !p.canVote ||
              !isConnected ||
              !isArbitrumSepolia ||
              p.voteStatusError;
            let reason = '';
            if (p.deadlinePassed) reason = 'Voting ended';
            else if (p.hasVoted) reason = 'You already voted';
            else if (p.voteStatusError) reason = 'Cannot verify vote status (check contract ABI)';
            else if (!isConnected) reason = 'Connect wallet';
            else if (!isArbitrumSepolia) reason = 'Wrong network';

            return (
              <li
                key={p.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Proposal #{p.id}
                    </p>
                    <p className="mt-2 text-base text-zinc-100">{p.description || '—'}</p>
                    <dl className="mt-4 flex flex-wrap gap-6 text-sm">
                      <div>
                        <dt className="text-zinc-500">Votes</dt>
                        <dd className="font-mono text-white">{p.voteCount.toString()}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">Deadline</dt>
                        <dd className="text-zinc-200">{deadlineLabel(p.deadline)}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="flex shrink-0 flex-col items-stretch gap-2 sm:w-40">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => void onVote(p.id)}
                      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {busy ? 'Confirm in wallet…' : 'Vote'}
                    </button>
                    {reason && (
                      <p className="text-center text-[11px] text-zinc-500">{reason}</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {voteError && (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {voteError}
        </p>
      )}
      {tx.error && (
        <p className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {tx.error.message}
        </p>
      )}
      {tx.isSuccess && (
        <p className="mt-4 text-sm text-emerald-400">
          Transaction confirmed{tx.hash ? ` · ${tx.hash.slice(0, 10)}…` : ''}
        </p>
      )}
    </main>
  );
}
