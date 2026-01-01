import { http, createConfig } from 'wagmi'
import { bsc, bscTestnet, mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [bscTestnet, bsc, mainnet], // Prioritize Testnet for the Hackathon
  connectors: [
    injected(), 
  ],
  transports: {
    [bscTestnet.id]: http(),
    [bsc.id]: http(),
    [mainnet.id]: http(),
  },
})