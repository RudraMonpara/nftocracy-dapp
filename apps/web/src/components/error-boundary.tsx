'use client';

import type { ReactNode } from 'react';
import React from 'react';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  message?: string;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  override componentDidCatch() {
    // Intentionally no-op: we only prevent a hard crash in UI.
  }

  private reset = () => {
    this.setState({ hasError: false, message: undefined });
  };

  override render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    const msg = this.state.message ?? 'Something went wrong.';
    const looksLikeWalletError =
      /metamask|wallet|connector|connect/i.test(msg) || msg.length < 180;

    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-300">
        <div className="font-medium text-zinc-100">Wallet UI error</div>
        <div className="mt-1 text-zinc-400">
          {looksLikeWalletError
            ? 'Could not connect to the wallet. If you are using MetaMask, make sure it is installed and unlocked, then try again.'
            : 'An unexpected UI error occurred. Try reloading.'}
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={this.reset}
            className="rounded-md border border-zinc-700 px-2 py-1 text-zinc-200 hover:bg-zinc-800"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md border border-zinc-700 px-2 py-1 text-zinc-200 hover:bg-zinc-800"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}

