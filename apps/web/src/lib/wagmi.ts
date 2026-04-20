import { cookieStorage, createConfig, createStorage, http } from 'wagmi';
import { injected, walletConnect } from 'wagmi/connectors';
import { chains } from './chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';


export const wagmiConfig = createConfig({
  chains,
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
  connectors: [
    injected(),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'NFTocracy',
        description: 'NFT-weighted voting on Arbitrum Sepolia',
        url: 'http://localhost:3000',
        icons: ['http://localhost:3000/favicon.ico'],
      },
    }),
  ],
  transports: Object.fromEntries(chains.map((chain) => [chain.id, http()])) as Record<
    number,
    ReturnType<typeof http>
  >,
});


declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig;
  }
}