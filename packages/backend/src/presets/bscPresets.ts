import { BscConfig } from '../types/bscConfig';

export interface BscNodePreset {
  nodeType: 'fast' | 'full' | 'archive' | 'validator';
  description: string;
  config: Partial<BscConfig['config']>;
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

// BSC Node Type Presets based on official documentation
export const BSC_NODE_PRESETS: Record<string, BscNodePreset> = {
  // Fast node - high performance, minimal state verification
  fast: {
    nodeType: 'fast',
    description: 'Fast node with --tries-verify-mode none for high performance',
    config: {
      cache: 10000, // 10GB as per official docs
      triesVerifyMode: 'none', // Fast node specific flag
      historyTransactions: 360000, // ~360k as per official docs
      rpcAllowUnprotectedTxs: true,
      syncMode: 'snap',
      gcMode: 'full',
      verbosity: 3,
      httpApi: 'eth,net,web3,txpool,parlia',
      wsApi: 'eth,net,web3',
      txpool: {
        globalslots: 20000,
        globalqueue: 10000,
        accountslots: 16,
        accountqueue: 64,
        lifetime: '3h0m0s',
      },
    },
    resources: {
      requests: {
        cpu: '16',
        memory: '32Gi',
      },
      limits: {
        cpu: '32',
        memory: '64Gi',
      },
    },
    persistence: {
      size: '2Ti', // Minimum 700GB per docs, 2TB is safe
    },
  },

  // Full node - complete validation with state verification
  full: {
    nodeType: 'full',
    description: 'Full node with complete validation and state verification',
    config: {
      cache: 10000, // 10GB as per official docs
      triesVerifyMode: 'local', // Full verification
      historyTransactions: 0, // Keep all history
      rpcAllowUnprotectedTxs: true,
      syncMode: 'snap',
      gcMode: 'full',
      verbosity: 3,
      httpApi: 'eth,net,web3,txpool,parlia,debug',
      wsApi: 'eth,net,web3',
      txpool: {
        globalslots: 20000,
        globalqueue: 10000,
        accountslots: 16,
        accountqueue: 64,
        lifetime: '3h0m0s',
      },
    },
    resources: {
      requests: {
        cpu: '16',
        memory: '64Gi',
      },
      limits: {
        cpu: '32',
        memory: '128Gi',
      },
    },
    persistence: {
      size: '3Ti', // Official minimum for full node
    },
  },

  // Archive node - complete historical data
  archive: {
    nodeType: 'archive',
    description: 'Archive node with full historical state (10TB+ storage required)',
    config: {
      cache: 10000, // 10GB cache
      triesVerifyMode: 'local',
      historyTransactions: 0, // Keep all transactions
      rpcAllowUnprotectedTxs: true,
      syncMode: 'full', // Archive needs full sync
      gcMode: 'archive', // No garbage collection
      verbosity: 3,
      httpApi: 'eth,net,web3,txpool,parlia,debug,trace',
      wsApi: 'eth,net,web3,debug',
      txpool: {
        globalslots: 20000,
        globalqueue: 10000,
        accountslots: 16,
        accountqueue: 64,
        lifetime: '3h0m0s',
      },
    },
    resources: {
      requests: {
        cpu: '16',
        memory: '128Gi', // Official minimum 128GB RAM
      },
      limits: {
        cpu: '32',
        memory: '256Gi',
      },
    },
    persistence: {
      size: '12Ti', // Official minimum 10TB, 12TB for safety
    },
  },

  // Validator node - block production and validation
  validator: {
    nodeType: 'validator',
    description: 'Validator node for block production (requires BNB stake)',
    config: {
      cache: 10000,
      triesVerifyMode: 'local',
      historyTransactions: 0,
      rpcAllowUnprotectedTxs: true,
      syncMode: 'snap',
      gcMode: 'full',
      verbosity: 3,
      httpApi: 'eth,net,web3,txpool,parlia',
      wsApi: 'eth,net,web3',
      txpool: {
        globalslots: 20000,
        globalqueue: 10000,
        accountslots: 16,
        accountqueue: 64,
        lifetime: '3h0m0s',
      },
    },
    resources: {
      requests: {
        cpu: '16',
        memory: '64Gi', // Official minimum for validator
      },
      limits: {
        cpu: '32',
        memory: '128Gi',
      },
    },
    persistence: {
      size: '3Ti',
    },
  },
};

/**
 * Get preset for a specific BSC node type
 */
export function getBscPreset(nodeType: string): BscNodePreset | undefined {
  return BSC_NODE_PRESETS[nodeType];
}

/**
 * Get all available BSC presets
 */
export function getAllBscPresets(): Record<string, BscNodePreset> {
  return BSC_NODE_PRESETS;
}
