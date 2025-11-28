import { EthNodeConfig } from '../types/ethConfig';
import { Resources, Persistence } from '../types/common';

export interface EthNodePreset {
  config: Partial<EthNodeConfig>;
  resources: Resources;
  persistence: Persistence;
  description: string;
}

export const ETH_NODE_PRESETS: Record<string, EthNodePreset> = {
  light: {
    description: 'Light node - minimal storage, downloads only headers',
    config: {
      syncMode: 'light',
      gcMode: 'full',
      stateScheme: 'path',
      cache: 2048, // 2GB minimum
      snapshot: false,
      historyState: 0,
      historyTransactions: 0,
      metricsEnabled: true,
      httpApi: 'eth,net,web3',
      wsApi: 'eth,net,web3',
    },
    resources: {
      requests: {
        cpu: '2', // Can run on low-power devices
        memory: '4Gi', // Minimum 4GB
      },
      limits: {
        cpu: '4',
        memory: '8Gi',
      },
    },
    persistence: {
      enabled: true,
      storageClass: 'local-path',
      size: '100Gi', // Very minimal storage
    },
  },

  full: {
    description: 'Full node - snap sync, recent ~128 blocks state (official minimum: 16GB RAM, 2TB SSD)',
    config: {
      syncMode: 'snap', // Recommended sync mode
      gcMode: 'full',
      stateScheme: 'path', // Path-based is more efficient
      cache: 16384, // 16GB recommended for full node
      snapshot: true,
      historyState: 90000, // Recent state (~128 blocks)
      historyTransactions: 2350000,
      metricsEnabled: true,
      httpApi: 'eth,net,web3,debug,txpool',
      wsApi: 'eth,net,web3',
      txpool: {
        accountslots: 16,
        globalslots: 5120,
        accountqueue: 64,
        globalqueue: 1024,
        lifetime: '3h0m0s',
      },
    },
    resources: {
      requests: {
        cpu: '8', // Official: quad-core minimum, 8 cores recommended
        memory: '16Gi', // Official: 16GB minimum
      },
      limits: {
        cpu: '16',
        memory: '32Gi',
      },
    },
    persistence: {
      enabled: true,
      storageClass: 'local-path',
      size: '2Ti', // Official: 2TB recommended (grows ~14GB/week)
    },
  },

  archive: {
    description: 'Archive node - full historical state, all queries supported',
    config: {
      syncMode: 'full',
      gcMode: 'archive',
      stateScheme: 'path',
      cache: 40960, // 40GB
      cacheDatabase: 50,
      cacheGc: 25,
      cacheSnapshot: 10,
      snapshot: true,
      historyState: 0, // Full archive
      historyTransactions: 0,
      metricsEnabled: true,
      httpApi: 'eth,net,web3,debug,trace,txpool',
      wsApi: 'eth,net,web3',
      txpool: {
        accountslots: 16,
        globalslots: 5120,
        accountqueue: 64,
        globalqueue: 1024,
        lifetime: '3h0m0s',
      },
    },
    resources: {
      requests: {
        cpu: '32',
        memory: '128Gi',
      },
    },
    persistence: {
      enabled: true,
      storageClass: 'local-path',
      size: '20Ti',
    },
  },

  validator: {
    description: 'Validator node - staking node with consensus client',
    config: {
      syncMode: 'snap',
      gcMode: 'full',
      stateScheme: 'path',
      cache: 16384, // 16GB
      snapshot: true,
      historyState: 90000,
      historyTransactions: 2350000,
      authrpcEnabled: true,
      authrpcPort: 8551,
      authrpcVhosts: 'localhost',
      metricsEnabled: true,
      httpApi: 'eth,net,web3',
      wsApi: 'eth,net,web3',
      txpool: {
        accountslots: 16,
        globalslots: 5120,
        accountqueue: 64,
        globalqueue: 1024,
        lifetime: '3h0m0s',
      },
    },
    resources: {
      requests: {
        cpu: '16',
        memory: '64Gi',
      },
    },
    persistence: {
      enabled: true,
      storageClass: 'local-path',
      size: '2Ti',
    },
  },
};

/**
 * Get preset for a specific Ethereum node type
 */
export function getEthPreset(nodeType: string): EthNodePreset | undefined {
  return ETH_NODE_PRESETS[nodeType];
}

/**
 * Get all available Ethereum presets
 */
export function getAllEthPresets(): Record<string, EthNodePreset> {
  return ETH_NODE_PRESETS;
}
