import { ArbNodeConfig, ArbNodeType } from '../types/arbConfig';

interface ArbNodePreset {
  nodeType: ArbNodeType;
  description: string;
  config: Partial<ArbNodeConfig>;
  resources: {
    requests: {
      cpu: string;
      memory: string;
    };
    limits?: {
      cpu?: string;
      memory?: string;
    };
  };
  persistence: {
    size: string;
  };
}

// Arbitrum Node Type Presets based on official documentation
export const ARB_NODE_PRESETS: Record<ArbNodeType, ArbNodePreset> = {
  // Full node - recommended for most use cases
  full: {
    nodeType: 'full',
    description: 'Full node with pruning (official: 4-core CPU, 16GB RAM, NVMe SSD)',
    config: {
      pruneMode: 'full',
      executionCachingArchive: false,
      cachingSnapshotKeep: 128,
      initLatest: 'pruned', // Use pruned snapshot for faster sync
      p2pMaxPeers: 50,
      httpApi: 'net,web3,eth,arb', // Standard APIs
      wsApi: 'net,web3,eth,arb',
    },
    resources: {
      requests: {
        cpu: '4', // Official minimum: 4-core CPU
        memory: '16Gi', // Official minimum: 16GB RAM
      },
      limits: {
        cpu: '8',
        memory: '32Gi',
      },
    },
    persistence: {
      size: '2Ti', // Depends on chain and traffic, 2TB is safe for Arbitrum One
    },
  },

  // Archive node - complete historical data
  archive: {
    nodeType: 'archive',
    description: 'Archive node with full historical state (official: Arb One 9.7TB + 850GB/month, Nova 4.3TB + 1.8TB/month)',
    config: {
      pruneMode: 'archive',
      executionCachingArchive: true, // Enable archive mode for Nitro
      cachingSnapshotKeep: 0, // No pruning for archive
      initLatest: 'archive', // Use archive snapshot
      p2pMaxPeers: 100,
      httpApi: 'net,web3,eth,arb,debug,trace', // Full API suite for archive
      wsApi: 'net,web3,eth,arb,debug',
      cachingTrieTimeLimit: '1h',
    },
    resources: {
      requests: {
        cpu: '4', // Official minimum: 4+ core CPU
        memory: '16Gi', // Official minimum: 16GB+ for Nitro
      },
      limits: {
        cpu: '8',
        memory: '32Gi',
      },
    },
    persistence: {
      size: '12Ti', // Arbitrum One: ~9.7TB + growth (850GB/month), 12Ti for buffer
    },
  },

  // Validator node - for staking and validation
  validator: {
    nodeType: 'validator',
    description: 'Validator node with watchtower mode (official: allowlisted for mainnet assertions)',
    config: {
      pruneMode: 'validator',
      executionCachingArchive: false,
      cachingSnapshotKeep: 128,
      initLatest: 'pruned',
      stakerEnable: true, // Enable validator mode
      stakerStrategy: 'Defensive', // Defensive strategy is common for validators
      p2pMaxPeers: 75,
      httpApi: 'net,web3,eth,arb',
      wsApi: 'net,web3,eth,arb',
      metricsEnable: true, // Important for monitoring validator performance
    },
    resources: {
      requests: {
        cpu: '4', // Same minimum as full node
        memory: '16Gi', // Official minimum for Nitro
      },
      limits: {
        cpu: '8',
        memory: '32Gi',
      },
    },
    persistence: {
      size: '3Ti', // Slightly more than full node for validator data
    },
  },
};

// Chain-specific configurations
export const ARB_CHAINS = {
  arb1: {
    chainId: 42161,
    chainName: 'arb1' as const,
    feedInputUrl: 'wss://arb1.arbitrum.io/feed',
    description: 'Arbitrum One (Mainnet)',
  },
  nova: {
    chainId: 42170,
    chainName: 'nova' as const,
    feedInputUrl: 'wss://nova.arbitrum.io/feed',
    description: 'Arbitrum Nova',
  },
  sepolia: {
    chainId: 421614,
    chainName: 'sepolia' as const,
    feedInputUrl: 'wss://sepolia-rollup.arbitrum.io/feed',
    description: 'Arbitrum Sepolia (Testnet)',
  },
};

// Helper function to get preset by node type
export function getArbPreset(nodeType: ArbNodeType): ArbNodePreset {
  const preset = ARB_NODE_PRESETS[nodeType];
  if (!preset) {
    throw new Error(`Unknown Arbitrum node type: ${nodeType}`);
  }
  return preset;
}

// Helper function to merge preset with custom config
export function applyArbPreset(
  baseConfig: Partial<ArbNodeConfig>,
  nodeType: ArbNodeType
): Partial<ArbNodeConfig> {
  const preset = getArbPreset(nodeType);
  return {
    ...baseConfig,
    ...preset.config,
  };
}
