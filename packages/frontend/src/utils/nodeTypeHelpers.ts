export type ChainType = 'arb' | 'bsc' | 'eth';

// Documentation URLs by chain and node type
const DOC_URLS: Record<ChainType, Record<string, string>> = {
  arb: {
    full: 'https://docs.arbitrum.io/node-running/how-tos/running-a-full-node',
    archive: 'https://docs.arbitrum.io/run-arbitrum-node/more-types/run-archive-node',
    validator: 'https://docs.arbitrum.io/run-arbitrum-node/more-types/run-validator-node',
  },
  bsc: {
    fast: 'https://docs.bnbchain.org/bnb-smart-chain/developers/node_operators/full_node/',
    full: 'https://docs.bnbchain.org/bnb-smart-chain/developers/node_operators/full_node/',
    archive: 'https://docs.bnbchain.org/bnb-smart-chain/developers/node_operators/full_node/',
    validator: 'https://docs.bnbchain.org/bnb-smart-chain/validator/run-val/',
  },
  eth: {
    light: 'https://geth.ethereum.org/docs/fundamentals/light-clients',
    full: 'https://geth.ethereum.org/docs/getting-started/consensus-clients',
    archive: 'https://geth.ethereum.org/docs/fundamentals/archive-nodes',
    validator: 'https://ethereum.org/en/developers/docs/nodes-and-clients/run-a-node/',
  },
};

// Node descriptions by chain and node type
const NODE_DESCRIPTIONS: Record<ChainType, Record<string, string>> = {
  arb: {
    full: 'Layer 2 node with pruned state running in watchtower mode. Validates rollup state against L1 and provides RPC access for dApps. Suitable for most production workloads requiring L2 interaction.',
    archive: 'Complete historical L2 state from genesis with full transaction history. Required for analytics, block explorers, and applications needing historical state queries across all Arbitrum blocks.',
    validator: 'Verifies L2 state correctness and can post assertions to L1. Watchtower mode monitors for fraud. Active validation requires allow-listing on mainnet. Essential for network security and dispute resolution.',
  },
  bsc: {
    fast: 'Optimized for high-performance RPC with minimal state verification. Ideal for applications requiring fast query responses with reduced resource overhead.',
    full: 'Complete blockchain validation with full state verification. Recommended for most production use cases requiring reliable RPC services and data integrity.',
    archive: 'Stores complete historical state from genesis block. Required for applications needing historical data queries, analytics platforms, and block explorers.',
    validator: 'Block production and consensus participation. Requires BNB stake and high availability infrastructure. Earns block rewards for securing the network.',
  },
  eth: {
    light: 'Downloads block headers only for minimal resource usage. Suitable for lightweight applications and mobile wallets requiring basic blockchain interaction without full validation.',
    full: 'Validates all blocks with snap sync, keeping recent state. Recommended for most applications requiring reliable RPC access, smart contract deployment, and transaction broadcasting.',
    archive: 'Maintains complete historical state from genesis. Essential for block explorers, analytics platforms, and applications requiring historical state queries at any block height.',
    validator: 'Participates in Proof-of-Stake consensus with block proposals and attestations. Requires 32 ETH stake, consensus client, and high uptime. Earns staking rewards and transaction fees.',
  },
};

// CPU tooltips by chain and node type
const CPU_TOOLTIPS: Record<ChainType, Record<string, string>> = {
  arb: {
    full: 'CPU cores reserved for full node. Use whole numbers (4) or millicores (4000m). Full nodes: 4-core minimum, single-core performance matters for Nitro.',
    archive: 'CPU cores reserved for archive node. Use whole numbers (4) or millicores (4000m). Archive nodes: 4-core minimum, high single-core performance for historical queries.',
    validator: 'CPU cores reserved for validator node. Use whole numbers (4) or millicores (4000m). Validators: 4-core minimum for state verification and L1 monitoring.',
  },
  bsc: {
    fast: 'CPU cores reserved for fast node. Use whole numbers (16) or millicores (16000m). Fast nodes: 16 cores recommended for high-performance RPC.',
    full: 'CPU cores reserved for full node. Use whole numbers (16) or millicores (16000m). Full nodes: 16 cores for complete validation.',
    archive: 'CPU cores reserved for archive node. Use whole numbers (32) or millicores (32000m). Archive nodes: 32+ cores required for historical state queries.',
    validator: 'CPU cores reserved for validator node. Use whole numbers (16) or millicores (16000m). Validators: 16+ cores for block production and consensus.',
  },
  eth: {
    light: 'CPU cores reserved for light node. Use whole numbers (2) or millicores (2000m). Light nodes: 2-4 cores for header-only sync.',
    full: 'CPU cores reserved for full node. Use whole numbers (8) or millicores (8000m). Full nodes: 8-16 cores recommended for snap sync and validation.',
    archive: 'CPU cores reserved for archive node. Use whole numbers (16) or millicores (16000m). Archive nodes: 16-32 cores required for historical state queries.',
    validator: 'CPU cores reserved for validator node. Use whole numbers (8) or millicores (8000m). Validators: 8+ cores for block proposals and attestations.',
  },
};

// Memory tooltips by chain and node type
const MEMORY_TOOLTIPS: Record<ChainType, Record<string, string>> = {
  arb: {
    full: 'RAM reserved for full node. Use Gi (gibibytes) or Mi (mebibytes). Full nodes: 16Gi minimum for pruned L2 state and watchtower mode.',
    archive: 'RAM reserved for archive node. Use Gi (gibibytes) or Mi (mebibytes). Archive nodes: 16Gi+ for complete historical L2 state.',
    validator: 'RAM reserved for validator node. Use Gi (gibibytes) or Mi (mebibytes). Validators: 16Gi+ for state verification and assertion posting.',
  },
  bsc: {
    fast: 'RAM reserved for fast node. Use Gi (gibibytes) or Mi (mebibytes). Fast nodes: 32-64Gi for high-performance operation.',
    full: 'RAM reserved for full node. Use Gi (gibibytes) or Mi (mebibytes). Full nodes: 64Gi for complete validation.',
    archive: 'RAM reserved for archive node. Use Gi (gibibytes) or Mi (mebibytes). Archive nodes: 128Gi+ for historical state storage.',
    validator: 'RAM reserved for validator node. Use Gi (gibibytes) or Mi (mebibytes). Validators: 64Gi+ for reliable block production.',
  },
  eth: {
    light: 'RAM reserved for light node. Use Gi (gibibytes) or Mi (mebibytes). Light nodes: 4-8Gi for minimal resource usage.',
    full: 'RAM reserved for full node. Use Gi (gibibytes) or Mi (mebibytes). Full nodes: 16-32Gi for snap sync and recent state.',
    archive: 'RAM reserved for archive node. Use Gi (gibibytes) or Mi (mebibytes). Archive nodes: 64Gi+ for complete historical state.',
    validator: 'RAM reserved for validator node. Use Gi (gibibytes) or Mi (mebibytes). Validators: 32Gi+ for consensus participation.',
  },
};

// Storage tooltips by chain and node type
const STORAGE_TOOLTIPS: Record<ChainType, Record<string, string>> = {
  arb: {
    full: 'Disk space for full node L2 data. 2Ti minimum (Arb One: ~560GB + 200GB/month growth). Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD strongly recommended.',
    archive: 'Disk space for archive node L2 data. 12Ti+ required (Arb One: ~9.7TB + 850GB/month growth). Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD mandatory.',
    validator: 'Disk space for validator node data. 2Ti minimum recommended for L2 state and L1 monitoring. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD mandatory.',
  },
  bsc: {
    fast: 'Disk space for fast node blockchain data. 3Ti minimum recommended. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD strongly recommended.',
    full: 'Disk space for full node blockchain data. 3Ti minimum recommended. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD strongly recommended.',
    archive: 'Disk space for archive node blockchain data. 10Ti+ required for complete historical state. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD mandatory.',
    validator: 'Disk space for validator node blockchain data. 3Ti minimum recommended. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD mandatory for validators.',
  },
  eth: {
    light: 'Disk space for light node data. 100Gi minimum for headers. Use Ti (tebibytes) or Gi (gibibytes). SSD recommended.',
    full: 'Disk space for full node blockchain data. 2Ti minimum (grows ~14GB/week). Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD strongly recommended.',
    archive: 'Disk space for archive node blockchain data. 12-20Ti+ required for complete history. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD mandatory.',
    validator: 'Disk space for validator node data. 2Ti minimum recommended. Use Ti (tebibytes) or Gi (gibibytes). NVMe SSD mandatory for validators.',
  },
};

export function getDocUrl(chainType: ChainType, nodeType: string): string {
  return DOC_URLS[chainType]?.[nodeType] || '#';
}

export function getNodeDescription(chainType: ChainType, nodeType: string): string {
  return NODE_DESCRIPTIONS[chainType]?.[nodeType] || `Configure and deploy your ${chainType.toUpperCase()} node to Kubernetes`;
}

export function getCpuTooltip(chainType: ChainType, nodeType: string): string {
  return CPU_TOOLTIPS[chainType]?.[nodeType] || 'CPU cores reserved for the node.';
}

export function getMemoryTooltip(chainType: ChainType, nodeType: string): string {
  return MEMORY_TOOLTIPS[chainType]?.[nodeType] || 'RAM reserved for the node.';
}

export function getStorageTooltip(chainType: ChainType, nodeType: string): string {
  return STORAGE_TOOLTIPS[chainType]?.[nodeType] || 'Disk space for blockchain data.';
}

export function getChainDisplayName(chainType: ChainType): string {
  const names: Record<ChainType, string> = {
    arb: 'Arbitrum',
    bsc: 'BSC',
    eth: 'Ethereum',
  };
  return names[chainType] || chainType;
}
