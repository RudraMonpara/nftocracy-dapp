'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useContract } from '@/hooks/useContract';

export default function CreateProposalPage() {
  const {
    configError,
    isConnected,
    isArbitrumSepolia,
    switchToArbitrumSepolia,
    createProposal,
    tx,
  } = useContract({ withProposals: false });

  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!tx.isSuccess) return;
    setDoneMessage('Proposal created on-chain.');
    setDescription('');
    setDuration('');
    tx.reset();
  }, [tx.isSuccess, tx.reset]);

  const busy = tx.isPending || tx.isConfirming;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setDoneMessage(null);
    tx.reset();

    const trimmed = description.trim();
    if (!trimmed) {
      setFormError('Description is required.');
      return;
    }
    const sec = duration.trim() === '' ? NaN : Number(duration);
    if (!Number.isFinite(sec) || sec <= 0 || !Number.isInteger(sec)) {
      setFormError('Duration must be a positive whole number of seconds.');
      return;
    }

    try {
      await createProposal(trimmed, BigInt(sec));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Transaction failed');
    }
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create proposal</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Opens a new vote window on your ERC-1155 voting contract.
        </p>
      </div>

      {configError ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          {configError}
        </div>
      ) : (
        <>
          {isConnected && !isArbitrumSepolia && (
            <div className="mb-6 rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
              <p className="text-sm text-zinc-300">Switch to Arbitrum Sepolia to submit.</p>
              <button
                type="button"
                onClick={() => void switchToArbitrumSepolia()}
                className="mt-3 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-400"
              >
                Switch network
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => void onSubmit(e)}
            className="space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
          >
            <div>
              <label htmlFor="desc" className="block text-sm font-medium text-zinc-300">
                Description
              </label>
              <textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                placeholder="What are members voting on?"
                disabled={busy}
              />
            </div>
            <div>
              <label htmlFor="dur" className="block text-sm font-medium text-zinc-300">
                Duration (seconds)
              </label>
              <input
                id="dur"
                type="number"
                min={1}
                step={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                placeholder="86400"
                disabled={busy}
              />
              <p className="mt-1 text-xs text-zinc-500">Example: 86400 = 24 hours</p>
            </div>

            <button
              type="submit"
              disabled={busy || !isConnected || !isArbitrumSepolia}
              className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy
                ? tx.isConfirming
                  ? 'Waiting for confirmation…'
                  : 'Confirm in wallet…'
                : 'Create proposal'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm">
            <Link href="/proposals" className="text-amber-400 hover:text-amber-300">
              ← Back to proposals
            </Link>
          </p>

          {formError && (
            <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {formError}
            </p>
          )}
          {tx.error && (
            <p className="mt-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {tx.error.message}
            </p>
          )}
          {doneMessage && (
            <p className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {doneMessage}
            </p>
          )}
        </>
      )}
    </main>
  );
}
