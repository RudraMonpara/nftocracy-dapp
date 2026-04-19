'use client';

import Link from 'next/link';
import { useContract } from '@/hooks/useContract';
import { VOTING_CHAIN_ID } from '@/lib/contract';

function formatAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function DashboardPage() {
  const {
    configError,
    contractAddress,
    account,
    isConnected,
    isArbitrumSepolia,
    switchToArbitrumSepolia,
    votingPower,
    balanceToken1,
    balanceToken2,
    readsPending,
    refetchAll,
  } = useContract({ withProposals: false });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Arbitrum Sepolia (chain {VOTING_CHAIN_ID}) · NFT-weighted voting
        </p>
      </div>

      {configError ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          {configError}
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Link
              href="/proposals"
              className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white"
            >
              Go to Proposals
            </Link>
            <Link
              href="/create"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-900"
            >
              Create Proposal
            </Link>
            <button
              type="button"
              onClick={() => void refetchAll()}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
            >
              Refresh
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
                Wallet
              </h2>
              {!isConnected ? (
                <p className="mt-3 text-sm text-zinc-400">
                  Connect your wallet with the control in the header.
                </p>
              ) : (
                <div className="mt-3 space-y-2 text-sm">
                  <p className="font-mono text-zinc-100">{formatAddress(account!)}</p>
                  <p className="text-zinc-500">{account}</p>
                </div>
              )}
              {isConnected && !isArbitrumSepolia && (
                <button
                  type="button"
                  onClick={() => void switchToArbitrumSepolia()}
                  className="mt-4 w-full rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
                >
                  Switch to Arbitrum Sepolia
                </button>
              )}
            </section>

            <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
                Contract
              </h2>
              <p className="mt-3 break-all font-mono text-xs text-zinc-300">
                {contractAddress}
              </p>
            </section>

            <section className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 md:col-span-2">
              <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
                Voting power &amp; NFT balances
              </h2>
              {readsPending && isConnected ? (
                <p className="mt-4 text-sm text-zinc-500">Loading on-chain data…</p>
              ) : !isConnected ? (
                <p className="mt-4 text-sm text-zinc-500">
                  Connect to load balances and voting power.
                </p>
              ) : (
                <dl className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-zinc-500">Voting power</dt>
                    <dd className="mt-1 text-lg font-semibold text-white">
                      {votingPower !== undefined ? votingPower.toString() : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-500">Balance · token #1</dt>
                    <dd className="mt-1 text-lg font-semibold text-white">
                      {balanceToken1 !== undefined ? balanceToken1.toString() : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-500">Balance · token #2</dt>
                    <dd className="mt-1 text-lg font-semibold text-white">
                      {balanceToken2 !== undefined ? balanceToken2.toString() : '—'}
                    </dd>
                  </div>
                </dl>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  );
}
