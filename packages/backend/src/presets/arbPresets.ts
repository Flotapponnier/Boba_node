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
    description: 'Full node with pruning, suitable for most RPC workloads',
    config: {
      pruneMode: 'full',
      executionCachingArchive: false,
      cachingSnapshotKeep: 128,
      initLatest: 'pruned',
      p2pMaxPeers: 50,
      httpApi: 'net,web3,eth,arb',
      wsApi: 'net,web3,eth,arb',
    },
    resources: {
      requests: {
        cpu: '4',
        memory: '16Gi',
      },
      limits: {
        cpu: '8',
        memory: '32Gi',
      },
    },
    persistence: {
      size: '2Ti',
    },
  },

  // Archive node - complete historical data
  archive: {
    nodeType: 'archive',
    description: 'Archive node with full historical state (9.7TB for Arbitrum One)',
    config: {
      pruneMode: 'archive',
      executionCachingArchive: true,
      cachingSnapshotKeep: 0, // No pruning for archive
      initLatest: 'archive',
      p2pMaxPeers: 100,
      httpApi: 'net,web3,eth,arb,debug,trace',
      wsApi: 'net,web3,eth,arb,debug',
      cachingTrieTimeLimit: '1h',
    },
    resources: {
      requests: {
        cpu: '8',
        memory: '32Gi',
      },
      limits: {
        cpu: '16',
        memory: '64Gi',
      },
    },
    persistence: {
      size: '12Ti', // Arbitrum One: ~9.7TB + growth buffer
    },
  },

  // Validator node - for staking and validation
  validator: {
    nodeType: 'validator',
    description: 'Validator node with staking capabilities',
    config: {
      pruneMode: 'validator',
      executionCachingArchive: false,
      cachingSnapshotKeep: 128,
      initLatest: 'pruned',
      stakerEnable: true,
      stakerStrategy: 'Defensive',
      p2pMaxPeers: 75,
      httpApi: 'net,web3,eth,arb',
      wsApi: 'net,web3,eth,arb',
      metricsEnable: true,
    },
    resources: {
      requests: {
        cpu: '8',
        memory: '24Gi',
      },
      limits: {
        cpu: '16',
        memory: '48Gi',
      },
    },
    persistence: {
      size: '3Ti',
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
