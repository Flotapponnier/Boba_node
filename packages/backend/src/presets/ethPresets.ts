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
    description: 'Light node - minimal storage, fast sync, limited queries',
    config: {
      syncMode: 'light',
      gcMode: 'full',
      stateScheme: 'path',
      cache: 2048, // 2GB
      snapshot: false,
      historyState: 0,
      historyTransactions: 0,
      metricsEnabled: true,
      httpApi: 'eth,net,web3',
      wsApi: 'eth,net,web3',
    },
    resources: {
      requests: {
        cpu: '2',
        memory: '4Gi',
      },
    },
    persistence: {
      enabled: true,
      storageClass: 'local-path',
      size: '100Gi',
    },
  },

  fast: {
    description: 'Fast node - optimized for RPC, recent state only',
    config: {
      syncMode: 'snap',
      gcMode: 'full',
      stateScheme: 'path',
      cache: 8192, // 8GB
      snapshot: true,
      historyState: 90000, // ~128 blocks
      historyTransactions: 2350000,
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
        cpu: '8',
        memory: '32Gi',
      },
    },
    persistence: {
      enabled: true,
      storageClass: 'local-path',
      size: '1.5Ti',
    },
  },

  full: {
    description: 'Full node - complete validation, recent state + full chain',
    config: {
      syncMode: 'snap',
      gcMode: 'full',
      stateScheme: 'path',
      cache: 16384, // 16GB
      snapshot: true,
      historyState: 90000,
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
